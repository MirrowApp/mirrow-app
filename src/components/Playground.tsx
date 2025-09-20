import { useEffect, useState } from "react";

const DEFAULT_CODE = String.raw`svg {
  box: (0, 0, 200, 200)
  size: (320px, 320px)
  preserve: (xMidYMid, meet)

  circle {
    id: "pulse"
    at: (100, 100)
    r: 40
    fill: "hotpink"

    animate {
      prop: "r"
      from: 40
      to: 60
      dur: 2s
      repeat: indefinite
    }
  }

  @hover, @active {
    #pulse {
      cy: 150px;
      r: 60px;
    }
  }
}
`;

const Playground = () => {
  const [source, setSource] = useState(DEFAULT_CODE);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("loading");

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    setStatus("loading");

    const debounceId = setTimeout(async () => {
      try {
        const response = await fetch("/api/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: source }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Compiler service returned an error.");
        }

        const payload: { success: boolean; svg?: string; error?: string } =
          await response.json();

        if (isCancelled) {
          return;
        }

        if (payload.success) {
          setSvg(payload.svg ?? "");
          setError(null);
        } else {
          setSvg("");
          setError(payload.error ?? "Unknown compiler error");
        }
      } catch (fetchError) {
        if (isCancelled || controller.signal.aborted) {
          return;
        }

        const message =
          fetchError instanceof Error ? fetchError.message : String(fetchError);
        setSvg("");
        setError(message);
      } finally {
        if (!isCancelled) {
          setStatus("idle");
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(debounceId);
    };
  }, [source]);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-8">
      <section className="flex w-full flex-col gap-3 md:w-1/2">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Mirrow source</h2>
          <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Live compile
          </span>
        </header>
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          className="min-h-[620px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white shadow-inner outline-none transition focus:border-white/40 focus:ring-0"
        />
        <p className="text-xs text-zinc-500">
          Type Mirrow DSL on the left. Valid syntax renders instantly; errors
          show on the right.
        </p>
      </section>
      <section className="flex w-full flex-col gap-3 md:w-1/2">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Output</h2>
          <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            SVG preview
          </span>
        </header>
        <div className="relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6">
          {status === "loading" && !svg && !error ? (
            <p className="text-sm text-zinc-500">Compiling…</p>
          ) : error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <p className="font-semibold">Compilation error</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-red-200/80">
                {error}
              </p>
            </div>
          ) : svg ? (
            <div className="max-h-full w-full max-w-full mx-auto overflow-auto">
              <div
                className="mx-auto w-fit"
                dangerouslySetInnerHTML={{ __html: svg }}
              ></div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              The compiler returned no output.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Playground;

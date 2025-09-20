import { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import {
  HighlightStyle,
  StreamLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { DEFAULT_MIRROW_SNIPPET } from "../data/default-mirrow-snippet";

const DEFAULT_CODE = DEFAULT_MIRROW_SNIPPET;

const Playground = () => {
  const [source, setSource] = useState(DEFAULT_CODE);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("loading");
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorContainerRef.current) {
      return;
    }

    const keywords = new Set([
      "svg",
      "circle",
      "rect",
      "path",
      "animate",
      "animateMotion",
      "animateTransform",
      "defs",
      "group",
      "linearGradient",
      "radialGradient",
      "stop",
    ]);

    const mirrowLanguage = StreamLanguage.define({
      token(stream) {
        if (stream.eatSpace()) {
          return null;
        }

        if (stream.match("//")) {
          stream.skipToEnd();
          return "comment";
        }

        if (stream.match("/*")) {
          while (!stream.eol()) {
            if (stream.match("*/", true)) {
              break;
            }
            stream.next();
          }
          return "comment";
        }

        if (stream.match(/"([^\\"]|\\.)*"/)) {
          return "string";
        }

        if (stream.match(/'([^\\']|\\.)*'/)) {
          return "string";
        }

        if (stream.match(/\b(?:true|false|infinite|indefinite)\b/)) {
          return "atom";
        }

        if (stream.match(/\b\d+(?:\.\d+)?(?:px|%)?\b/)) {
          return "number";
        }

        if (stream.peek() === "@") {
          stream.next();
          stream.match(/[\w-]+/);
          return "meta";
        }

        const char = stream.peek();
        if (char === "(") {
          stream.next();
          return "bracket";
        }
        if (char === ")") {
          stream.next();
          return "bracket";
        }
        if (char === "{") {
          stream.next();
          return "brace";
        }
        if (char === "}") {
          stream.next();
          return "brace";
        }

        const wordMatch = stream.match(/[A-Za-z_][\w-]*/);
        if (wordMatch) {
          const word =
            typeof wordMatch === "string"
              ? wordMatch
              : (wordMatch as RegExpMatchArray)[0];
          if (keywords.has(word)) {
            return "keyword";
          }
          return "variableName";
        }

        stream.next();
        return null;
      },
    });

    const mirrowHighlight = HighlightStyle.define([
      { tag: tags.keyword, color: "#38bdf8" },
      { tag: tags.variableName, color: "#e2e8f0" },
      { tag: tags.string, color: "#f472b6" },
      { tag: tags.number, color: "#c4b5fd" },
      { tag: tags.comment, color: "#64748b", fontStyle: "italic" },
      { tag: tags.atom, color: "#facc15" },
      { tag: tags.meta, color: "#fb7185" },
      { tag: tags.bracket, color: "#f8fafc" },
      { tag: tags.brace, color: "#f8fafc" },
    ]);

    const mirrowTheme = EditorView.theme(
      {
        "&": {
          backgroundColor: "transparent",
          color: "#f8fafc",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: "0.875rem",
        },
        ".cm-content": {
          padding: "1.25rem 1rem",
        },
        ".cm-scroller": {
          overflow: "auto",
        },
        ".cm-selectionBackground, ::selection": {
          backgroundColor: "#334155",
        },
        "&.cm-editor.cm-focused": {
          outline: "none",
        },
      },
      { dark: true }
    );

    const state = EditorState.create({
      doc: source,
      extensions: [
        keymap.of([...defaultKeymap, indentWithTab]),
        mirrowLanguage,
        syntaxHighlighting(mirrowHighlight, { fallback: true }),
        EditorView.lineWrapping,
        mirrowTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setSource(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorContainerRef.current });

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

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
        <div
          ref={editorContainerRef}
          className="min-h-[420px] w-full rounded-2xl border border-white/10 bg-white/5 text-sm text-white shadow-inner"
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
                {JSON.parse(error).error || error}
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

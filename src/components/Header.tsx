import { useEffect, useMemo, useState } from "react";

const INLINE_STYLE_ID = "header-inline-styles";

const ensureInlineStyles = () => {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(INLINE_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = INLINE_STYLE_ID;
  style.textContent = `
    @keyframes chroma-text-animation {
      0% {
        background-position: 100% 0;
        filter: blur(1px);
      }
      100% {
        background-position: 0 0;
        filter: blur(0px);
      }
    }

    @keyframes mirrow-logo-poppin {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(22px);
      }
    }

    .chroma-text {
      background: linear-gradient(
        90deg,
        #fff 0,
        #fff 50.33%,
        #c679c4 40%,
        #fa3d1d 45%,
        #ffb005 50%,
        #e1e1fe 55%,
        #0358f7 60%,
        transparent 66.67%,
        transparent
      );
      background-size: 200% 100%;
      background-clip: text;
      color: transparent;
    }

    .chrome-text-animation {
      animation: chroma-text-animation 1.5s ease-in-out forwards;
    }

    .mirrow-logo-appear {
      animation: mirrow-logo-poppin 1.5s ease-out forwards;
    }
  `;

  document.head.appendChild(style);
};

const MirrowLogo = () => {
  const maskId = useMemo(
    () => `mirrow-mask-${Math.random().toString(36).slice(2)}`,
    []
  );

  return (
    <svg viewBox="0 0 44 24" width="44" height="24" aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="44" height="24" x="0" y="0" fill="white" />
          <circle r="15.5" cx="14" cy="12" fill="black" />
        </mask>
      </defs>
      <circle cx="14" cy="12" r="12" fill="white" />
      <g mask={`url(#${maskId})`}>
        <circle
          cx="10"
          cy="12"
          r="12"
          fill="white"
          className="mirrow-logo-appear"
        />
      </g>
    </svg>
  );
};

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30"
    aria-hidden="true"
    className="h-full w-full"
  >
    <path d="M15 3C8.373 3 3 8.373 3 15c0 5.623 3.872 10.328 9.092 11.63-.056-.162-.092-.35-.092-.583v-2.051c-.487 0-1.303 0-1.508 0-.821 0-1.551-.353-1.905-1.009-.393-.729-.461-1.844-1.435-2.526-.289-.227-.069-.486.264-.451.615.174 1.125.596 1.605 1.222.478.627.703.769 1.596.769.433 0 1.081-.025 1.691-.121.328-.833.895-1.6 1.588-1.962-3.996-.411-5.903-2.399-5.903-5.098 0-1.162.495-2.286 1.336-3.233-.386-.976-.733-2.893-.004-3.623 1.798 0 2.885 1.166 3.146 1.481.896-.309 1.88-.483 2.914-.483 1.036 0 2.024.174 2.922.483.261-.315 1.349-1.485 3.151-1.485.732.731.381 2.656.102 3.594.836.945 1.328 2.066 1.328 3.226 0 2.697-1.904 4.684-5.894 5.097.878.471 1.679 2.081 1.679 3.294v2.734c0 .104-.023.179-.035.268C23.641 24.676 27 20.236 27 15c0-6.627-5.373-12-12-12Z" />
  </svg>
);

const Header = () => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    ensureInlineStyles();

    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const containerClasses = [
    "border-[#383838] z-40 fixed top-4 left-0 md:block hidden right-0 mx-auto my-8 flex w-full max-w-3xl justify-between rounded-full border p-3 backdrop-blur-sm transition-all ease-in-out",
    "transform-gpu",
    isAtTop
      ? "translate-y-0 opacity-100 duration-200"
      : "-translate-y-12 opacity-0 duration-300 pointer-events-none",
  ].join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex w-full gap-4">
        <a href="/" className="flex gap-4">
          <span className="my-auto h-6 w-11">
            <MirrowLogo />
          </span>
          <p className="chrome-text-animation chroma-text my-auto font-inter text-2xl font-black">
            mirrow
          </p>
        </a>
        <div className="my-auto flex gap-8 px-6 font-medium">
          <a href="/docs">Docs</a>
          <a href="/playground" className="flex items-center gap-2">
            <p>Playground</p>
            <div className="rounded-full bg-pink-600 px-2 py-0.5 text-sm text-black">
              NEW
            </div>
          </a>
        </div>
        <a
          href="https://github.com/MirrowApp"
          target="_blank"
          rel="noreferrer"
          className="ml-auto my-auto size-10 fill-[#aaa] transition-all duration-300 hover:-translate-y-0.5 hover:fill-white"
        >
          <GithubIcon />
        </a>
      </div>
    </div>
  );
};

export default Header;

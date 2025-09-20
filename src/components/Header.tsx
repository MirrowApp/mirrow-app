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

    @keyframes mobile-menu-slide-in {
      from {
        transform: translateY(-8rem);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .mobile-menu-panel {
      animation: mobile-menu-slide-in 0.3s ease-out;
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

const navItems = [
  { href: "/docs", label: "Docs" },
  {
    href: "/playground",
    label: "Playground",
    badge: { text: "NEW", className: "bg-pink-600 text-black" },
  },
];

const Header = () => {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    "border-[#383838] z-40 md:fixed top-4 left-0 right-0 mx-auto my-8 flex w-full max-w-3xl justify-between rounded-full border p-3 backdrop-blur-sm transition-all ease-in-out",
    "transform-gpu",
    isAtTop
      ? "translate-y-0 opacity-100 duration-200"
      : "-translate-y-12 opacity-0 duration-300 pointer-events-none",
  ].join(" ");

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    if (typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => {
      if (mediaQuery.matches) {
        setIsMenuOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const renderNavLinks = (onSelect?: () => void) =>
    navItems.map((item) => (
      <a
        key={item.href}
        href={item.href}
        className="flex items-center gap-2 text-sm font-medium text-zinc-200 transition-colors hover:text-white focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={onSelect}
      >
        <span>{item.label}</span>
        {item.badge ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.badge.className}`}
          >
            {item.badge.text}
          </span>
        ) : null}
      </a>
    ));

  return (
    <div className="px-4 md:px-0">
      <div className={containerClasses}>
        <div className="flex w-full items-center gap-4">
          <a href="/" className="flex gap-4">
            <span className="my-auto h-6 w-11">
              <MirrowLogo />
            </span>
            <p className="chrome-text-animation chroma-text my-auto font-inter text-2xl font-black">
              mirrow
            </p>
          </a>

          <nav className="ml-6 hidden items-center gap-8 text-sm text-zinc-200 md:flex">
            {renderNavLinks()}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/MirrowApp"
              target="_blank"
              rel="noreferrer"
              className="hidden size-10 items-center justify-center rounded-full border border-white/10 fill-[#aaa] transition-all duration-300 hover:-translate-y-0.5 hover:fill-white md:flex"
              aria-label="Mirrow on GitHub"
            >
              <GithubIcon />
            </a>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full border border-[#383838] text-white transition hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
              aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isMenuOpen ? "true" : "false"}
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <span className="sr-only">Close</span>
              ) : (
                <span className="sr-only">Menu</span>
              )}
              <div aria-hidden="true" className="pointer-events-none">
                {isMenuOpen ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      fill="currentColor"
                      d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.59L7.1 5.7A1 1 0 0 0 5.7 7.1L10.59 12L5.7 16.9a1 1 0 1 0 1.4 1.4L12 13.41l4.9 4.89a1 1 0 0 0 1.4-1.4L13.41 12l4.89-4.9a1 1 0 0 0 0-1.4Z"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      fill="currentColor"
                      d="M4 7a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5A1 1 0 0 1 4 7Zm0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H5Z"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-transparent"
            onClick={closeMenu}
          >
            <span className="sr-only">Close navigation</span>
          </button>
          <div className="relative z-10 mx-4 mt-4 flex flex-col rounded-3xl bg-zinc-950 px-6 py-10 shadow-xl mobile-menu-panel">
            <div className="flex flex-col gap-6 text-base text-zinc-200">
              {renderNavLinks(closeMenu)}
              <a
                href="https://github.com/MirrowApp"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm font-medium text-zinc-200 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={closeMenu}
              >
                <span>GitHub</span>
                <span aria-hidden="true" className="size-6 fill-current">
                  <GithubIcon />
                </span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Header;

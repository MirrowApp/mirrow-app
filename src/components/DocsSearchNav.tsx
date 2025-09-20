import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

type NavItem = {
  name: string;
  slug: string;
  title?: string;
  href?: string;
};

type DocsSearchNavProps = {
  items: NavItem[];
  activeSlug: string;
};

const staticNavItems: NavItem[] = [
  { name: "Getting started", slug: "overview", href: "/docs" },
  { name: "Installation", slug: "installation", href: "/docs/installation" },
];

const baseLinkClasses =
  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150";
const activeLinkClasses = "bg-white text-black hover:bg-white hover:text-black";
const inactiveLinkClasses = "text-zinc-400 hover:bg-white/10 hover:text-white";

const DocsSearchNav = ({ items, activeSlug }: DocsSearchNavProps) => {
  const [query, setQuery] = useState("");
  const [isNavReady, setNavReady] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedQuery.length) {
      return items;
    }

    return items.filter((item) => {
      const name = item.name.toLowerCase();
      const title = item.title?.toLowerCase() ?? "";

      return name.includes(normalizedQuery) || title.includes(normalizedQuery);
    });
  }, [items, normalizedQuery]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  useEffect(() => {
    const node = navRef.current;
    if (!node) {
      setNavReady(true);
      return;
    }

    const storageKey = "docs-nav-scroll";
    let canUseStorage = true;
    let didScheduleReveal = false;

    const frameIds: number[] = [];
    let hasRevealed = false;

    const reveal = () => {
      if (!hasRevealed) {
        hasRevealed = true;
        setNavReady(true);
      }
    };

    try {
      const savedValue = sessionStorage.getItem(storageKey);
      if (savedValue) {
        const parsed = Number(savedValue);
        if (Number.isFinite(parsed)) {
          const frameId = requestAnimationFrame(() => {
            if (navRef.current) {
              navRef.current.scrollTop = parsed;
            }
            reveal();
          });
          frameIds.push(frameId);
          didScheduleReveal = true;
        }
      }
    } catch (error) {
      canUseStorage = false;
    }

    if (!didScheduleReveal) {
      const frameId = requestAnimationFrame(reveal);
      frameIds.push(frameId);
    }

    const handleScroll = () => {
      if (!canUseStorage) {
        return;
      }

      try {
        sessionStorage.setItem(storageKey, String(node.scrollTop));
      } catch (error) {
        canUseStorage = false;
      }
    };

    node.addEventListener("scroll", handleScroll);

    return () => {
      node.removeEventListener("scroll", handleScroll);
      frameIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  const renderNavLink = (item: NavItem) => {
    const isActive = item.slug === activeSlug;
    const href = item.href ?? `/docs/${item.slug}`;
    const linkClasses = `${baseLinkClasses} ${
      isActive ? activeLinkClasses : inactiveLinkClasses
    }`;

    return (
      <a
        key={item.slug}
        href={href}
        className={linkClasses}
        data-docs-nav-link
        aria-current={isActive ? "page" : undefined}
      >
        <code className="text-sm font-semibold">{item.name}</code>
      </a>
    );
  };

  return (
    <>
      <label className="mt-6 block" htmlFor="docs-search">
        <span className="sr-only">Search elements</span>
        <div className="relative flex items-center rounded-xl border border-white/10 bg-white/5 focus-within:border-white/40">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none ml-3 h-4 w-4 text-zinc-400"
          >
            <path
              fill="currentColor"
              d="M10.5 3a7.5 7.5 0 0 1 5.89 12.1l4.25 4.26a1 1 0 0 1-1.42 1.41l-4.26-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z"
            />
          </svg>
          <input
            id="docs-search"
            type="search"
            placeholder="Search elements"
            className="w-full rounded-xl border-0 bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            autoComplete="off"
            enterKeyHint="search"
            value={query}
            onChange={handleChange}
          />
        </div>
      </label>
      <nav
        className={`mt-5 flex-1 flex flex-col gap-1.5 overflow-y-auto transition-opacity duration-200 ${
          isNavReady ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-live="polite"
        ref={navRef}
      >
        {staticNavItems.map(renderNavLink)}

        <div
          className="mt-4 flex items-center gap-3 px-3 text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500/80"
          role="separator"
        >
          <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
          <span aria-hidden="true">Elements</span>
          <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
        </div>

        {filteredItems.map(renderNavLink)}

        {filteredItems.length === 0 ? (
          <p className="rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-400">
            No elements found.
          </p>
        ) : null}
      </nav>
    </>
  );
};

export default DocsSearchNav;

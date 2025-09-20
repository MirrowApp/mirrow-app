import { useMemo, useState, type ChangeEvent } from "react";

type NavItem = {
  name: string;
  slug: string;
  title?: string;
};

type DocsSearchNavProps = {
  items: NavItem[];
  activeSlug: string;
};

const baseLinkClasses =
  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150";
const activeLinkClasses = "bg-white text-black hover:bg-white hover:text-black";
const inactiveLinkClasses = "text-zinc-400 hover:bg-white/10 hover:text-white";

const DocsSearchNav = ({ items, activeSlug }: DocsSearchNavProps) => {
  const [query, setQuery] = useState("");

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
        className="mt-5 flex-1 flex flex-col gap-1.5 overflow-y-auto"
        aria-live="polite"
      >
        {filteredItems.map((item) => {
          const isActive = item.slug === activeSlug;
          const href = `/docs/${item.slug}`;
          const linkClasses = `${baseLinkClasses} ${
            isActive ? activeLinkClasses : inactiveLinkClasses
          }`;

          return (
            <a
              key={item.slug}
              href={href}
              className={linkClasses}
              data-docs-nav-link
            >
              <code className="text-sm font-semibold">{item.name}</code>
            </a>
          );
        })}

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

import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

const ATTRIBUTES_PATH = join(rootDir, "ATTRIBUTES.md");
const DOCS_DIR = join(rootDir, "src", "pages", "docs");
const DATA_DIR = join(rootDir, "src", "data");

const raw = await readFile(ATTRIBUTES_PATH, "utf8");
const elements = parseAttributeDocument(raw);
const manifest = await buildDocs(elements);

console.log(
  `Generated documentation for ${manifest.length} elements to src/pages/docs/*`
);

function parseAttributeDocument(markdown) {
  const lines = markdown.split(/\r?\n/);
  const elements = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("## <")) {
      const match = line.match(/^## <([^>]+)>/);
      if (match) {
        if (current) {
          elements.push(current);
        }
        current = { name: match[1], attributes: [] };
      }
      continue;
    }

    if (!current) {
      continue;
    }

    if (line.startsWith("- ")) {
      const attr = parseAttributeLine(line);
      if (attr) {
        current.attributes.push(attr);
      }
      continue;
    }
  }

  if (current) {
    elements.push(current);
  }

  return elements;
}

function parseAttributeLine(line) {
  const match = line.match(/^- `([^`]+)` — type ([^.;]+)(.*)$/);
  if (!match) {
    return {
      raw: line,
    };
  }

  const [, name, type, remainderRaw] = match;
  const trimmedRemainder = remainderRaw.trim().replace(/\.$/, "");
  const remainder = trimmedRemainder.startsWith(";")
    ? trimmedRemainder.slice(1).trim()
    : trimmedRemainder.trim();

  const segments = remainder.length
    ? remainder
        .split(";")
        .map((segment) => segment.trim())
        .filter(Boolean)
    : [];

  const info = {
    name,
    type: type.trim(),
    required: false,
    mapsTo: [],
    notes: [],
  };

  for (const segment of segments) {
    const lower = segment.toLowerCase();
    if (lower === "required") {
      info.required = true;
      continue;
    }

    if (lower.startsWith("required")) {
      info.required = true;
    }

    if (lower.startsWith("maps to")) {
      const matches = [...segment.matchAll(/`([^`]+)`/g)].map(
        (capture) => capture[1]
      );
      if (matches.length) {
        info.mapsTo.push(...matches);
      } else {
        info.mapsTo.push(segment.replace(/^maps to\s*/i, "").trim());
      }
      continue;
    }

    info.notes.push(segment);
  }

  return info;
}

async function buildDocs(elements) {
  await mkdir(DOCS_DIR, { recursive: true });
  await mkdir(DATA_DIR, { recursive: true });

  const existingDocs = await readdir(DOCS_DIR, { withFileTypes: true }).catch(
    () => []
  );
  await Promise.all(
    existingDocs
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".md") &&
          entry.name !== "index.astro"
      )
      .map((entry) => rm(join(DOCS_DIR, entry.name)))
  );

  const manifest = [];

  for (const [index, element] of elements.entries()) {
    const slug = toSlug(element.name);
    const outputPath = join(DOCS_DIR, `${slug}.md`);
    const content = buildElementMarkdown(element, { index, slug });
    await writeFile(outputPath, content, "utf8");

    manifest.push({
      name: element.name,
      slug,
      title: `<${element.name}>`,
      order: index + 1,
    });
  }

  const manifestPayload = {
    generatedAt: new Date().toISOString(),
    elements: manifest,
  };

  await writeFile(
    join(DATA_DIR, "docs-manifest.json"),
    JSON.stringify(manifestPayload, null, 2) + "\n",
    "utf8"
  );

  return manifest;
}

function buildElementMarkdown(element, { index, slug }) {
  const frontmatter = [
    "---",
    "layout: ../../layouts/DocsLayout.astro",
    `title: "Mirrow Docs • ${element.name}"`,
    `elementName: "${element.name}"`,
    `slug: "${slug}"`,
    `order: ${index + 1}`,
    "---",
    "",
  ];

  const intro = [
    `# \`${element.name}\` element`,
    "",
    "This page outlines the attributes Mirrow exposes for this tag.",
    "Values map to native SVG where possible and list Mirrow compiler expansions when relevant.",
    "",
    "## Attributes",
    "",
    "| Attribute | Type | Maps To | Notes |",
    "| --- | --- | --- | --- |",
  ];

  const rows = element.attributes.length
    ? element.attributes.map((attr) => formatAttributeRow(attr))
    : ["| _No attributes documented._ | | | |"];

  return [...frontmatter, ...intro, ...rows, "", ""].join("\n");
}

function formatAttributeRow(attr) {
  if (!attr.name) {
    const content = attr.raw ?? "";
    return `| ${content.replace(/\|/g, "\\|")} | | | |`;
  }

  const attributeCell = attr.required
    ? `\`${attr.name}\`<br /><span class="mt-2 inline-block rounded-full bg-pink-500/20 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-pink-400">required</span>`
    : `\`${attr.name}\``;

  const typeCell = `\`${attr.type}\``;

  const mapsToCell = attr.mapsTo.length
    ? attr.mapsTo.map((value) => `\`${value}\``).join("<br />")
    : "&mdash;";

  const notesCell = attr.notes.length
    ? attr.notes.map((note) => note.replace(/\.$/, "")).join("<br />")
    : "";

  return `| ${attributeCell} | ${typeCell} | ${mapsToCell} | ${notesCell} |`;
}

function toSlug(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

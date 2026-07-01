import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
// @ts-expect-error — no bundled types
import taskLists from "markdown-it-task-lists";
// @ts-expect-error — no bundled types
import texmath from "markdown-it-texmath";
import katex from "katex";
import type { TocItem } from "./types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight: (str, lang) => {
    if (lang && lang.toLowerCase() === "mermaid") return "";
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true })
          .value;
      } catch {
        /* fall through */
      }
    }
    return ""; // let markdown-it escape it
  },
});

md.use(taskLists, { enabled: true, label: true });
md.use(texmath, {
  engine: katex,
  delimiters: "dollars",
  katexOptions: { throwOnError: false, strict: false },
});

// Fenced-code override to route `mermaid` blocks to the diagram renderer.
const defaultFence =
  md.renderer.rules.fence ??
  ((tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options));

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const info = (tokens[idx].info || "").trim().toLowerCase();
  if (info === "mermaid") {
    return `<div class="mermaid">${escapeHtml(tokens[idx].content)}</div>\n`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

// Anchor affordance beside headings.
md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
  const id = tokens[idx].attrGet("id");
  const anchor = id
    ? `<a class="heading-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>`
    : "";
  return self.renderToken(tokens, idx, options) + anchor;
};

function slugify(text: string, used: Set<string>): string {
  let base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!base) base = "section";
  let slug = base;
  let n = 1;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

export interface RenderResult {
  html: string;
  toc: TocItem[];
}

/** Render Markdown to HTML and extract a table of contents. */
export function renderMarkdown(src: string): RenderResult {
  const tokens = md.parse(src, {});
  const toc: TocItem[] = [];
  const used = new Set<string>();

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === "heading_open") {
      const level = Number(t.tag.slice(1));
      const inline = tokens[i + 1];
      const text = inline && inline.type === "inline" ? inline.content : "";
      const id = slugify(text.replace(/[#*`_~[\]()]/g, ""), used);
      t.attrSet("id", id);
      if (level <= 3 && text) toc.push({ id, text, level });
    }
  }

  const html = md.renderer.render(tokens, md.options, {});
  return { html, toc };
}

/** Lazily render any mermaid diagrams inside a container. */
export async function renderMermaid(
  container: HTMLElement,
  dark: boolean
): Promise<void> {
  const nodes = container.querySelectorAll<HTMLElement>(
    ".mermaid:not([data-processed])"
  );
  if (nodes.length === 0) return;
  try {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: dark ? "dark" : "neutral",
      fontFamily: "var(--font-ui)",
    });
    await mermaid.run({ nodes: Array.from(nodes) });
  } catch (e) {
    // Leave the source visible if the diagram fails to render.
    console.warn("Mermaid render failed:", e);
  }
}

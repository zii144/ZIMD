import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown — table of contents", () => {
  it("extracts headings with levels, text, and ids", () => {
    const { toc } = renderMarkdown("# Title\n\n## Sub-Heading");
    expect(toc).toEqual([
      { id: "title", text: "Title", level: 1 },
      { id: "sub-heading", text: "Sub-Heading", level: 2 },
    ]);
  });

  it("assigns unique ids to duplicate headings", () => {
    const { toc } = renderMarkdown("# Intro\n\n# Intro");
    expect(toc.map((t) => t.id)).toEqual(["intro", "intro-1"]);
  });

  it("only includes headings up to level 3 in the TOC", () => {
    const { toc } = renderMarkdown("# A\n\n#### Deep");
    expect(toc.map((t) => t.text)).toEqual(["A"]);
  });

  it("emits heading ids into the HTML", () => {
    const { html } = renderMarkdown("## Getting Started");
    expect(html).toContain('id="getting-started"');
  });
});

describe("renderMarkdown — rich rendering", () => {
  it("routes mermaid fences to a diagram container", () => {
    const { html } = renderMarkdown("```mermaid\ngraph TD; A-->B;\n```");
    expect(html).toContain('<div class="mermaid">');
    expect(html).not.toContain("<pre"); // not a normal code block
  });

  it("highlights fenced code with a language", () => {
    const { html } = renderMarkdown("```js\nconst x = 1;\n```");
    expect(html).toMatch(/hljs|language-js/);
  });

  it("renders task lists as checkboxes", () => {
    const { html } = renderMarkdown("- [x] done\n- [ ] todo");
    expect(html).toContain('type="checkbox"');
  });

  it("renders inline math with KaTeX", () => {
    const { html } = renderMarkdown("The area is $A = \\pi r^2$.");
    expect(html).toContain("katex");
  });

  it("renders tables", () => {
    const { html } = renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });
});

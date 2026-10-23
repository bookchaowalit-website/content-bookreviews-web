import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown, parseBlocks, safeHref } from "@/lib/markdown";

describe("markdown renderer", () => {
  it("parses paragraphs, lists and headings", () => {
    expect(parseBlocks("# T\n\nOne\ntwo\n\n- a\n- b\n\n1. x")).toEqual([
      { type: "heading", level: 1, text: "T" },
      { type: "paragraph", text: "One two" },
      { type: "list", ordered: false, items: ["a", "b"] },
      { type: "list", ordered: true, items: ["x"] },
    ]);
  });

  it("escapes HTML in the source instead of injecting it", () => {
    const html = renderToString(<Markdown source={'Hi <script>alert(1)</script> **bold**'} />);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("drops a leading title heading that repeats the page title", () => {
    expect(renderToString(<Markdown source={"# Deep Work\n\nBody"} title="Deep Work" />)).toBe("<p>Body</p>");
  });

  it("only links safe URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("//evil.example")).toBeNull();
    expect(safeHref("https://example.com")).toBe("https://example.com");
    expect(renderToString(<Markdown source={"[x](javascript:alert(1))"} />)).not.toContain("href");
  });
});

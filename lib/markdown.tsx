import Link from "next/link";
import type { ReactNode } from "react";

// A small, safe markdown renderer for the review notes in content/book-reviews: headings, paragraphs, fenced code,
// ordered and unordered lists, **bold**, *italic*, `code` and [links](url). Everything becomes React
// elements, so text (including HTML inside code samples) is always escaped; there is no raw HTML path.

export type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "list"; ordered: boolean; items: string[] };

export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence (or end of input)
      blocks.push({ type: "code", lang: fence[1], code: code.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length as 1 | 2 | 3 | 4, text: heading[2].trim() });
      i++;
      continue;
    }
    const listItem = /^\s*(?:[-*]|\d+\.)\s+/;
    if (listItem.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && listItem.test(lines[i]) && /^\s*\d+\./.test(lines[i]) === ordered) items.push(lines[i++].replace(listItem, "").trim());
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const text: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s)/.test(lines[i]) && !listItem.test(lines[i])) text.push(lines[i++].trim());
    blocks.push({ type: "paragraph", text: text.join(" ") });
  }
  return blocks;
}

/** Only http(s), mailto and site-relative links are rendered as links. */
export function safeHref(href: string): string | null {
  return /^(https?:\/\/|mailto:|\/(?!\/))/i.test(href) ? href : null;
}

export function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*)\*/g;
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${n++}`;
    const [, code, bold, label, href, italic] = match;
    if (code !== undefined) out.push(<code key={key}>{code}</code>);
    else if (bold !== undefined) out.push(<strong key={key}>{renderInline(bold, key)}</strong>);
    else if (italic !== undefined) out.push(<em key={key}>{renderInline(italic, key)}</em>);
    else out.push(renderLink(label, href, key));
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderLink(label: string, href: string, key: string): ReactNode {
  const safe = safeHref(href);
  if (!safe) return <span key={key}>{label}</span>;
  if (safe.startsWith("/")) return <Link href={safe} key={key}>{label}</Link>;
  return <a href={safe} key={key} rel="noopener noreferrer" target="_blank">{label}</a>;
}

/** Renders the page body. A leading "# Title" that repeats the page title is dropped (the page header shows it). */
export function Markdown({ source, title }: { source: string; title?: string }) {
  const blocks = parseBlocks(source);
  if (blocks[0]?.type === "heading" && blocks[0].level === 1 && blocks[0].text === title) blocks.shift();
  return (
    <>
      {blocks.map((block, index) => {
        const key = `b-${index}`;
        switch (block.type) {
          case "heading": {
            const Tag = `h${block.level}` as const;
            return <Tag key={key}>{renderInline(block.text, key)}</Tag>;
          }
          case "code":
            return <pre key={key} tabIndex={0}><code className={block.lang ? `language-${block.lang}` : undefined}>{block.code}</code></pre>;
          case "list": {
            const items = block.items.map((item, j) => <li key={j}>{renderInline(item, `${key}-${j}`)}</li>);
            return block.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
          }
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>;
        }
      })}
    </>
  );
}

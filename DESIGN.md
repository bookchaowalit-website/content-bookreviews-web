# Design direction

Since 2026-11-19 Book Reviews uses the shared Reader shell (see `READER.md`): Geist via `next/font`,
the `--rs-*` tokens in `app/reader-shell.css` (light and dark, WCAG 2.2 AA), 44px targets, one h1 per
page and a forced-colors fallback. The film-cutting-bench look (black and orange, 10px mono labels,
a three-column strip that left an empty column) is retired.

- `/` — what the ledger is, the date the last review was added, and every review as a row (date and
  rating, title, author, category).
- `/book-reviews` — the full index with category chips (`?category=`) and a result count.
- `/book-reviews/<slug>` — header (author, reading date, rating, ISBN), the note rendered by
  `lib/markdown.tsx` (a body `# h1` becomes an h2), previous / next in index order.

No cover art: the reviews carry ISBNs, but covers are not fetched (no third-party image calls).

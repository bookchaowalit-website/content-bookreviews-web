# Book Reviews

A read-only Next.js reading ledger over **three local markdown reviews** in `content/book-reviews/*.mdx`
(Deep Work, Atomic Habits, The Pragmatic Programmer). There is no editor, no accounts and no cover images.

## What it does

- `/` shows the newest review and the next ones; `/book-reviews` lists all reviews, newest first.
- `/book-reviews/<slug>` renders one review. The markdown is turned into React elements by a small renderer in
  `lib/markdown.tsx` (headings, paragraphs, lists, fenced code, bold, italic, inline code, links), so HTML in the
  content is always shown as text and only http(s), mailto and site-relative links are rendered. Pages are
  pre-rendered from the files; unknown or malformed slugs 404.
- `/api/mcp` answers JSON-RPC `initialize`, `tools/list` and `tools/call` with `get_reviews` (optional `category`),
  `get_review`, `search_reviews` and `get_categories` over the same files. It echoes the request id; unknown tools,
  slugs and methods return JSON-RPC errors. It runs on Node.js and ships `content/` with the function.
- Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What it does not do

No reading-status tracking, structured critiques, user ratings, search UI or cover art. MDX components are not executed.

## Layout

- `lib/mdx.ts`: reads the reviews, coerces frontmatter types, validates slugs, sorts, filters, lists categories.
- `lib/markdown.tsx`: the safe markdown renderer.
- `app/page.tsx`, `app/book-reviews/page.tsx`, `app/book-reviews/[slug]/page.tsx`: pages. `app/api/mcp/route.ts`: MCP endpoint.
- `lib/sentry.ts`, `instrumentation.ts`, `instrumentation-client.ts`: Sentry setup.
- `tests/`: Vitest tests for the loader, renderer, pages, detail route, MCP route and Sentry scrubbing.

## Run

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
```

CI: shared `platform-ci-workflows` v1.1.1 (lint, typecheck, tests with an 85% line-coverage gate, build, security scan).

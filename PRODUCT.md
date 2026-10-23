# Book Reviews — Product truth

> Inferred from the code and copy (no user interview). Checked against the portfolio card claims review
> (`portfolio-site-web/docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`, row `bookreviews`) on 2026-10-23.

## What it is

A read-only personal reading ledger: three authored reviews in `content/book-reviews/*.mdx` (title, author,
rating, category, date and ISBN in the frontmatter, the note in markdown), rendered by Next.js.

## Who it is for

A portfolio visitor who wants to read short personal book notes in a text-first editorial layout.

## What works today

1. `/` shows the newest review, the review count and the next saved reviews.
2. `/book-reviews` lists every review, newest first, with category and rating.
3. `/book-reviews/<slug>` renders one review; the markdown note becomes real paragraphs, bold text and lists, with
   any HTML in the source shown as text. Unknown or malformed slugs return 404.
4. `/api/mcp` answers JSON-RPC with `get_reviews`, `get_review`, `search_reviews` and `get_categories` over the
   same files, echoing the request id; unknown tools and methods return JSON-RPC errors.
5. Front-end and server errors go to Sentry (errors only, personal data stripped) when `NEXT_PUBLIC_SENTRY_DSN` is set.

## What does not work (and must not be claimed)

- No reading-status tracking, genre tagging workflow, structured liked/disliked/who-for critiques or traffic
  outcomes (card claims flagged in the 2026-10 review). Visitors cannot add or rate books.
- No cover images (the archive says so), no search box on the site (search exists only as the MCP tool), no
  accounts or storage. The `.mdx` files are read as plain markdown; MDX components are not executed.

## Live URL and deploy state

- Live: https://bookreviews.bookchaowalit.com (HTTP 200 on 2026-10-23). On the live build every detail page
  (for example `/book-reviews/deep-work`) returns 404: the page read `params.slug` without awaiting the Next 16
  params Promise. The fix is on `main`.
- Last production deploy: 2026-10-23 12:04 (+07), Vercel CLI, commit 42cee43 (the CVE patch). The Vercel project
  `bookchaowalit-bookreviews-frontend` has a Git link naming the old repository
  (`bookchaowalit/bookchaowalit-bookreviews-frontend`), so a push to `main` does not deploy. The L2 commits stay
  undeployed until the owner reconnects Vercel Git to `bookchaowalit-website/content-bookreviews-web` (owner action D9).
- `NEXT_PUBLIC_SENTRY_DSN` is set on the Vercel project (Sentry project `content-bookreviews-web`, org `personal-yu0`).

## Boundaries

- Reads only its own `content/book-reviews/` directory; slugs are validated (lowercase kebab-case) before any file read.
- No personal data is collected.

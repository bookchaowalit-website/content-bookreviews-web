import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArticleHeader, EmptyState, EntryList, Pager, Prose, Reader, ReaderFoot, ReaderHead, ReaderTop, ResultCount, TagFilter,
  formatDate, neighbours, type Entry, type PagerLink,
} from "@/components/reader-shell";
import { Markdown } from "@/lib/markdown";
import { categoriesOf, type BookReview } from "@/lib/mdx";

// The book reviews on the Reader shell. Route files stay thin; these views take plain data,
// so the tests can render them with no reviews or a category.

export const SITE = "https://bookreviews.bookchaowalit.com";
const SOURCE = "https://github.com/bookchaowalit-website/content-bookreviews-web";

export function ReviewFrame({ current, children }: { current?: "index"; children: ReactNode }) {
  return (
    <Reader>
      <ReaderTop name="Book Reviews" tagline="Chaowalit Greepoke" links={[{ href: "/book-reviews", label: "All reviews", current: current === "index" }]} />
      <main id="main" className="rs-main">{children}</main>
      <ReaderFoot source={SOURCE} links={[{ href: "/api/mcp", label: "MCP API" }]} note="Personal reading notes, written by hand: not recommendations or sponsored reviews. No cover art is attached." />
    </Reader>
  );
}

export const rating = (review: BookReview) => `Rated ${review.rating} of 5`;
const toEntry = (review: BookReview): Entry => ({
  href: `/book-reviews/${review.slug}`,
  title: review.title,
  summary: `by ${review.author}`,
  date: review.date,
  meta: [rating(review)],
  tags: review.category ? [review.category] : [],
});
const indexHref = (category = "") => (category ? `/book-reviews?${new URLSearchParams({ category })}` : "/book-reviews");

/** Home: what the ledger is, when it last changed, and every review (there are few), newest first. */
export function HomeView({ reviews }: { reviews: BookReview[] }) {
  return (
    <ReviewFrame>
      <ReaderHead
        title="Notes from the books that stayed."
        lede="A small reading ledger across habits, craft and focused work. Each review is a dated personal note, not a recommendation."
      >
        {reviews.length > 0 ? <Link className="rs-button" href="/book-reviews">Browse by category</Link> : null}
      </ReaderHead>
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet">Reviews appear here once they are written.</EmptyState>
      ) : (
        <section aria-labelledby="latest">
          <div className="rs-section-head"><h2 id="latest">Reviews</h2></div>
          <p className="rs-count">Last review added {formatDate(reviews[0].date)}.</p>
          <EntryList headingLevel={3} entries={reviews.map(toEntry)} />
        </section>
      )}
    </ReviewFrame>
  );
}

/** The full index with category chips (?category=). */
export function IndexView({ reviews, category = "" }: { reviews: BookReview[]; category?: string }) {
  const categories = categoriesOf(reviews);
  const current = categories.includes(category) ? category : "";
  const shown = current ? reviews.filter((r) => r.category === current) : reviews;
  return (
    <ReviewFrame current="index">
      <ReaderHead title="All reviews" lede="Every review, newest first, with the book's author, the reading date and a rating out of five." />
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet">Reviews appear here once they are written.</EmptyState>
      ) : (
        <>
          <div className="rs-toolbar">
            <TagFilter
              label="Filter by category"
              options={[{ label: "All", href: indexHref(), current: !current, count: reviews.length }, ...categories.map((c) => ({ label: c, href: indexHref(c), current: c === current, count: reviews.filter((r) => r.category === c).length }))]}
            />
            <ResultCount shown={shown.length} total={reviews.length} noun="review" filter={current || undefined} />
          </div>
          <EntryList entries={shown.map(toEntry)} />
        </>
      )}
    </ReviewFrame>
  );
}

/** One review: header (author, date, rating, ISBN), the note, then previous / next in index order. */
export function ReviewView({ review, reviews }: { review: BookReview; reviews: BookReview[] }) {
  const { previous, next } = neighbours(reviews, reviews.findIndex((r) => r.slug === review.slug));
  const link = (r?: BookReview): PagerLink | undefined => (r ? { href: `/book-reviews/${r.slug}`, title: r.title } : undefined);
  return (
    <ReviewFrame current="index">
      <article className="rs-article">
        <ArticleHeader
          back={{ href: "/book-reviews", label: "All reviews" }}
          tags={review.category ? [review.category] : []}
          title={review.title}
          lede={`by ${review.author}`}
          date={review.date}
          meta={[rating(review), ...(review.isbn ? [`ISBN ${review.isbn}`] : [])]}
        />
        <Prose><Markdown source={review.content} title={review.title} /></Prose>
        <Pager previous={link(previous)} next={link(next)} label="More reviews" />
      </article>
    </ReviewFrame>
  );
}

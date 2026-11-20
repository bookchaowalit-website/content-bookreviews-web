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
      <ReaderFoot source={SOURCE} links={[{ href: "/mcp", label: "MCP API" }]} note="Personal reading notes, written by hand: not recommendations or sponsored reviews. No cover art is attached." />
    </Reader>
  );
}

export const rating = (review: BookReview) => `Rated ${review.rating} of 5`;
const toEntry = (review: BookReview, category = ""): Entry => ({
  href: `/book-reviews/${review.slug}${category ? `?${new URLSearchParams({ category })}` : ""}`,
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
          <p className="rs-count">Most recent read: {reviews[0].title}, {formatDate(reviews[0].date)}.</p>
          <EntryList headingLevel={3} entries={reviews.map((review) => toEntry(review))} />
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
          <EntryList entries={shown.map((review) => toEntry(review, current))} />
        </>
      )}
    </ReviewFrame>
  );
}

/**
 * One review: header (author, date, rating, ISBN), the note, then previous / next in index order. Opened from a
 * category (?category=), Back returns to that category and previous / next stay inside it.
 */
export function ReviewView({ review, reviews, category = "" }: { review: BookReview; reviews: BookReview[]; category?: string }) {
  const current = category && review.category === category ? category : "";
  const list = current ? reviews.filter((r) => r.category === current) : reviews;
  const { previous, next } = neighbours(list, list.findIndex((r) => r.slug === review.slug));
  const link = (r?: BookReview): PagerLink | undefined => (r ? { href: toEntry(r, current).href, title: r.title } : undefined);
  return (
    <ReviewFrame current="index">
      <article className="rs-article">
        <ArticleHeader
          back={current ? { href: indexHref(current), label: `Reviews in ${current}` } : { href: "/book-reviews", label: "All reviews" }}
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

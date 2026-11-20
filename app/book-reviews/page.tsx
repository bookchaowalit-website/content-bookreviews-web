import type { Metadata } from "next";
import { IndexView } from "@/components/review-views";
import { getAllBookReviews } from "@/lib/mdx";
import { shareMetadata } from "@/lib/share";

export const metadata: Metadata = shareMetadata(
  "/book-reviews",
  "All reviews",
  "Every book review, newest first, with the book's author, the reading date and a rating out of five.",
);

// Pre-rendered. A known ?category= is rewritten to category/[category] (next.config.ts); an unknown one lands
// here and shows every review.
export default async function BookReviewsPage() {
  return <IndexView reviews={await getAllBookReviews()} />;
}

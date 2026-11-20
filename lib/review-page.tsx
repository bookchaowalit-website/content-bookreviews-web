import { notFound } from "next/navigation";
import { ReviewView } from "@/components/review-views";
import { getAllBookReviews, getBookReviewBySlug } from "@/lib/mdx";

/** One review page, shared by /book-reviews/[slug] and its in/[category] twin (category "" = none). */
export async function renderReview(slug: string, category = "") {
  const review = await getBookReviewBySlug(slug);
  if (!review) notFound();
  return <ReviewView review={review} reviews={await getAllBookReviews()} category={category} />;
}

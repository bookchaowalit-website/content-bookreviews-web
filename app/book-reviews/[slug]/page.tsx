import type { Metadata } from "next";
import { renderReview } from "@/lib/review-page";
import { getAllBookReviews, getBookReviewBySlug } from "@/lib/mdx";
import { shareMetadata } from "@/lib/share";

// Next 16 passes route params as a Promise.
interface PageProps { params: Promise<{ slug: string }> }
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllBookReviews()).map((review) => ({ slug: review.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const review = await getBookReviewBySlug((await params).slug);
  if (!review) return {};
  // Each review shares as itself (layout.tsx sets the home page's Open Graph data).
  return shareMetadata(
    `/book-reviews/${review.slug}`,
    `${review.title} by ${review.author}`,
    `A personal review of ${review.title} by ${review.author}, rated ${review.rating} of 5.`,
    "article",
  );
}

// Pre-rendered. A known ?category= is rewritten to [slug]/in/[category] (next.config.ts).
export default async function BookReviewPage({ params }: PageProps) {
  return renderReview((await params).slug);
}

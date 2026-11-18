import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewView } from "@/components/review-views";
import { getAllBookReviews, getBookReviewBySlug } from "@/lib/mdx";

// Next 16 passes route params as a Promise.
interface PageProps { params: Promise<{ slug: string }> }
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllBookReviews()).map((review) => ({ slug: review.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const review = await getBookReviewBySlug((await params).slug);
  return review ? { title: `${review.title} by ${review.author}`, description: `A personal review of ${review.title} by ${review.author}.`, alternates: { canonical: `/book-reviews/${review.slug}` } } : {};
}

export default async function BookReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const review = await getBookReviewBySlug(slug);
  if (!review) notFound();
  return <ReviewView review={review} reviews={await getAllBookReviews()} />;
}

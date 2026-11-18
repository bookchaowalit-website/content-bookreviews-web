import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewView, SITE } from "@/components/review-views";
import { getAllBookReviews, getBookReviewBySlug } from "@/lib/mdx";

// Next 16 passes route params as a Promise.
interface PageProps { params: Promise<{ slug: string }>; searchParams?: Promise<{ category?: string | string[] }> }
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllBookReviews()).map((review) => ({ slug: review.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const review = await getBookReviewBySlug((await params).slug);
  if (!review) return {};
  const title = `${review.title} by ${review.author}`;
  const description = `A personal review of ${review.title} by ${review.author}, rated ${review.rating} of 5.`;
  // Each review shares as itself (layout.tsx sets the home page's Open Graph data).
  return {
    title,
    description,
    alternates: { canonical: `/book-reviews/${review.slug}` },
    openGraph: { type: "article", url: `${SITE}/book-reviews/${review.slug}`, title, description, siteName: "Book Reviews" },
    twitter: { card: "summary", title, description },
  };
}

export default async function BookReviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const review = await getBookReviewBySlug(slug);
  if (!review) notFound();
  const { category } = (await searchParams) ?? {};
  return <ReviewView review={review} reviews={await getAllBookReviews()} category={(Array.isArray(category) ? category[0] : category) ?? ""} />;
}

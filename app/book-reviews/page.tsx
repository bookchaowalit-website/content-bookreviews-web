import type { Metadata } from "next";
import { IndexView } from "@/components/review-views";
import { getAllBookReviews } from "@/lib/mdx";

export const metadata: Metadata = { title: "All reviews", alternates: { canonical: "/book-reviews" } };

type Search = { category?: string | string[] };

export default async function BookReviewsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { category } = await searchParams;
  return <IndexView reviews={await getAllBookReviews()} category={(Array.isArray(category) ? category[0] : category) ?? ""} />;
}

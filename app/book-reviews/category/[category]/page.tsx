import { IndexView } from "@/components/review-views";
import { getAllBookReviews } from "@/lib/mdx";
import { routableCategories } from "@/lib/category-routes";

// The index filtered to one category, served for /book-reviews?category=<category> by a rewrite
// (next.config.ts), so the filtered list is pre-rendered too. Shares and canonicalises as /book-reviews.
export { metadata } from "@/app/book-reviews/page";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await routableCategories()).map((category) => ({ category }));
}

export default async function CategoryIndexPage({ params }: { params: Promise<{ category: string }> }) {
  return <IndexView reviews={await getAllBookReviews()} category={(await params).category} />;
}

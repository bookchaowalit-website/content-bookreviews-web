import { getAllBookReviews } from "@/lib/mdx";
import { routableCategories } from "@/lib/category-routes";
import { generateMetadata } from "@/app/book-reviews/[slug]/page";
import { renderReview } from "@/lib/review-page";

// One review opened from a category, served for /book-reviews/<slug>?category=<category> by a rewrite
// (next.config.ts). Every review × category pair is pre-rendered; ReviewView ignores a category the review is
// not in, as the plain page would. Shares and canonicalises as the plain review URL.
export { generateMetadata };
export const dynamicParams = false;

export async function generateStaticParams() {
  const [reviews, categories] = await Promise.all([getAllBookReviews(), routableCategories()]);
  return reviews.flatMap((review) => categories.map((category) => ({ slug: review.slug, category })));
}

export default async function ReviewInCategoryPage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug, category } = await params;
  return renderReview(slug, category);
}

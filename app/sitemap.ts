import type { MetadataRoute } from "next";
import { SITE } from "@/components/review-views";
import { getAllBookReviews } from "@/lib/mdx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reviews = await getAllBookReviews();
  return [
    { url: `${SITE}/`, lastModified: reviews[0]?.date },
    { url: `${SITE}/book-reviews`, lastModified: reviews[0]?.date },
    ...reviews.map((review) => ({ url: `${SITE}/book-reviews/${review.slug}`, lastModified: review.date })),
  ];
}

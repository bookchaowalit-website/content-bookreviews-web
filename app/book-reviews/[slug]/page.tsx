import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookReviewBySlug, getAllBookReviews } from "@/lib/mdx";
import { Markdown } from "@/lib/markdown";

// Next 16 passes route params as a Promise.
interface PageProps { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export async function generateStaticParams() { const reviews = await getAllBookReviews(); return reviews.map((review) => ({ slug: review.slug })); }

export default async function BookReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const review = await getBookReviewBySlug(slug);
  if (!review) notFound();
  return <div className="review-room"><main className="review-shell"><nav className="review-nav" aria-label="Book reviews navigation"><Link href="/book-reviews" className="review-mark">Contact sheet</Link><span className="review-mark">{review.category} / {review.date}</span></nav><article className="review-detail"><header><span className="frame-label">Reading cut / {review.isbn}</span><h1>{review.title}</h1><p className="author">by {review.author}</p><div className="detail-meta"><span><strong>Category</strong> {review.category}</span><span><strong>Read</strong> {review.date}</span><span><strong>Rating</strong> {review.rating}/5</span></div></header><div className="review-copy"><Markdown source={review.content} title={review.title} /></div><footer className="review-footer">This frame is a personal note, not a recommendation or a sponsored review.</footer></article></main></div>;
}

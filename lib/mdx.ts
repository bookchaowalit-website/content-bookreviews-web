import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface BookReview {
  slug: string;
  title: string;
  author: string;
  rating: number;
  category: string;
  date: string;
  isbn: string;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "book-reviews");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && SLUG.test(slug);
}

function text(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value === undefined || value === null ? "" : String(value);
}

/** Frontmatter is authored YAML: coerce each field so a date or number never leaks through as another type. */
export function toReview(slug: string, source: string): BookReview {
  const { data, content } = matter(source);
  const rating = Number(data.rating);
  return {
    slug,
    title: text(data.title) || slug,
    author: text(data.author),
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, Math.round(rating))) : 0,
    category: text(data.category),
    date: text(data.date),
    isbn: text(data.isbn),
    content: content.trim(),
  };
}

export function sortNewestFirst(reviews: BookReview[]): BookReview[] {
  return [...reviews].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export async function getAllBookReviews(): Promise<BookReview[]> {
  const files = (await fs.readdir(CONTENT_DIR)).filter((file) => file.endsWith(".mdx"));
  const reviews = await Promise.all(
    files.map(async (file) => toReview(file.replace(/\.mdx$/, ""), await fs.readFile(path.join(CONTENT_DIR, file), "utf8"))),
  );
  return sortNewestFirst(reviews);
}

export async function getBookReviewBySlug(slug: unknown): Promise<BookReview | null> {
  if (!isValidSlug(slug)) return null;
  try {
    return toReview(slug, await fs.readFile(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export function filterReviews(reviews: BookReview[], query: string): BookReview[] {
  const q = query.trim().toLowerCase();
  if (!q) return reviews;
  return reviews.filter((review) =>
    [review.title, review.author, review.category, review.content].some((field) => field.toLowerCase().includes(q)),
  );
}

export async function searchBookReviews(query: string): Promise<BookReview[]> {
  return filterReviews(await getAllBookReviews(), query);
}

export function categoriesOf(reviews: BookReview[]): string[] {
  return [...new Set(reviews.map((review) => review.category).filter(Boolean))];
}

export async function getBookCategories(): Promise<string[]> {
  return categoriesOf(await getAllBookReviews());
}

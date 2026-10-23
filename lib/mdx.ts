import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface BookReview {
  slug: string;
  title: string;
  author: string;
  rating: number;
  category: string;
  date: string;
  isbn: string;
  cover: string;
  content: string;
}

export async function getAllBookReviews() {
  const contentDir = path.join(process.cwd(), 'content', 'book-reviews');
  const files = await fs.readdir(contentDir);
  const mdxFiles = files.filter(file => file.endsWith('.mdx'));

  const reviews = await Promise.all(
    mdxFiles.map(async (file) => {
      const filePath = path.join(contentDir, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      return {
        ...data,
        slug: file.replace('.mdx', ''),
        content
      } as BookReview;
    })
  );

  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBookReviewBySlug(slug: string) {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'book-reviews');
    const filePath = path.join(contentDir, `${slug}.mdx`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return {
      ...data,
      slug,
      content
    } as BookReview;
  } catch (error) {
    return null;
  }
}

export async function searchBookReviews(query: string) {
  const reviews = await getAllBookReviews();
  const lowercaseQuery = query.toLowerCase();

  return reviews.filter(review =>
    review.title.toLowerCase().includes(lowercaseQuery) ||
    review.author.toLowerCase().includes(lowercaseQuery) ||
    review.category.toLowerCase().includes(lowercaseQuery) ||
    review.content.toLowerCase().includes(lowercaseQuery)
  );
}

export async function getBookCategories() {
  const reviews = await getAllBookReviews();
  const categories = [...new Set(reviews.map(review => review.category))];
  return categories;
}
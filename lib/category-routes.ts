import { categoriesOf, getAllBookReviews } from "./mdx";

// `?category=` is how the site links a category (index chips, review links, Back, previous / next). Reading
// `searchParams` in a page makes every request render on the server, so instead next.config rewrites a known
// category to a pre-rendered path segment and the pages read `params`. The visible URL keeps `?category=`.

/** Path segment the rewrite targets; only plain slugs, so the value needs no escaping in a URL or a regex. */
export const ROUTABLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function routableCategories(): Promise<string[]> {
  return categoriesOf(await getAllBookReviews()).filter((category) => ROUTABLE.test(category));
}

/** beforeFiles rewrites: /book-reviews?category=x and /book-reviews/<slug>?category=x to their static twins. */
export async function categoryRewrites() {
  const categories = await routableCategories();
  if (categories.length === 0) return [];
  const has = [{ type: "query" as const, key: "category", value: `(?<category>${categories.join("|")})` }];
  return [
    { source: "/book-reviews", has, destination: "/book-reviews/category/:category" },
    { source: "/book-reviews/:slug([a-z0-9-]+)", has, destination: "/book-reviews/:slug/in/:category" },
  ];
}

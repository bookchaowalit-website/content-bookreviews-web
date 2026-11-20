// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BookReviewsPage, { metadata as indexMetadata } from "@/app/book-reviews/page";
import CategoryIndexPage, { generateStaticParams as categoryParams, metadata as categoryMetadata } from "@/app/book-reviews/category/[category]/page";
import BookReviewPage from "@/app/book-reviews/[slug]/page";
import ReviewInCategoryPage, { generateStaticParams as reviewCategoryParams } from "@/app/book-reviews/[slug]/in/[category]/page";
import { metadata as mcpMetadata } from "@/app/mcp/page";
import { ROUTABLE } from "@/lib/category-routes";
import nextConfig from "../next.config";

const page = (node: React.ReactNode) => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<>{node}</>);
  return host;
};

describe("category pages stay pre-rendered", () => {
  it("no index or review page takes searchParams (reading them makes every request dynamic)", () => {
    expect(BookReviewsPage.length).toBe(0);
    // The review page receives only { params }.
    expect(BookReviewPage.toString()).not.toContain("searchParams");
  });

  it("rewrites a known ?category= to its pre-rendered twin, before the filesystem routes", async () => {
    const rewrites = await nextConfig.rewrites!();
    expect(Array.isArray(rewrites)).toBe(false);
    const { beforeFiles } = rewrites as { beforeFiles: unknown[] };
    const has = [{ type: "query", key: "category", value: "(?<category>non-fiction|self-help|tech)" }];
    expect(beforeFiles).toEqual([
      { source: "/book-reviews", has, destination: "/book-reviews/category/:category" },
      { source: "/book-reviews/:slug([a-z0-9-]+)", has, destination: "/book-reviews/:slug/in/:category" },
    ]);
    expect(ROUTABLE.test("Non Fiction")).toBe(false);
  });

  it("pre-renders each category index and every review × category pair", async () => {
    expect(await categoryParams()).toEqual([{ category: "non-fiction" }, { category: "self-help" }, { category: "tech" }]);
    expect(await reviewCategoryParams()).toHaveLength(9);
  });

  it("filters the index from the path segment and keeps the category on review pages", async () => {
    const index = page(await CategoryIndexPage({ params: Promise.resolve({ category: "tech" }) }));
    expect(index.querySelector(".rs-count")?.textContent).toBe("Showing 1 of 3 reviews in tech");
    expect(index.querySelector(".rs-entry-link")?.getAttribute("href")).toBe("/book-reviews/the-pragmatic-programmer?category=tech");
    const review = page(await ReviewInCategoryPage({ params: Promise.resolve({ slug: "the-pragmatic-programmer", category: "tech" }) }));
    expect(review.querySelector(".rs-back")?.getAttribute("href")).toBe("/book-reviews?category=tech");
    expect(categoryMetadata).toBe(indexMetadata);
  });
});

describe("share data per page", () => {
  it("the index and the MCP page share as themselves, not as the home page", () => {
    expect(indexMetadata.openGraph).toMatchObject({ url: "https://bookreviews.bookchaowalit.com/book-reviews", title: "All reviews" });
    expect(indexMetadata.twitter).toMatchObject({ title: "All reviews" });
    expect(indexMetadata.alternates).toEqual({ canonical: "/book-reviews" });
    expect(mcpMetadata.openGraph).toMatchObject({ url: "https://bookreviews.bookchaowalit.com/mcp", title: "MCP API", description: "How to call the Book Reviews read-only MCP endpoint." });
    expect(mcpMetadata.twitter).toMatchObject({ title: "MCP API" });
  });
});

describe("every category chip has a route", () => {
  it("each category in content/book-reviews is a lowercase slug, so its chip filters (READER.md: chip count = result)", async () => {
    const { categoriesOf, getAllBookReviews } = await import("@/lib/mdx");
    const categories = categoriesOf(await getAllBookReviews());
    expect(categories.length).toBeGreaterThan(0);
    // A category like "Software Design" would show a chip that cannot route; write it as "software-design".
    expect(categories.filter((category) => !ROUTABLE.test(category))).toEqual([]);
  });
});

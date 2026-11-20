// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeView, IndexView, ReviewView } from "@/components/review-views";
import type { BookReview } from "@/lib/mdx";
import Home from "@/app/page";
import BookReviewsPage from "@/app/book-reviews/page";
import { generateMetadata } from "@/app/book-reviews/[slug]/page";
import McpPage from "@/app/mcp/page";
import ReviewInCategoryPage from "@/app/book-reviews/[slug]/in/[category]/page";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import nextConfig from "../next.config";

const page = (node: React.ReactNode) => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<>{node}</>);
  return host;
};
const texts = (host: Element, selector: string) => [...host.querySelectorAll(selector)].map((el) => el.textContent);
const review = (slug: string, category: string, date: string): BookReview => ({ slug, title: slug, author: "A", rating: 3, category, date, isbn: "", content: "Text" });
const sample = [review("b", "tech", "2024-03-01"), review("a", "craft", "2024-02-01"), review("c", "tech", "2024-01-01")];

describe("home page", () => {
  it("lists every review newest first with author, rating and the last-updated date", async () => {
    const host = page(await Home());
    expect(host.querySelectorAll("h1").length).toBe(1);
    expect(host.querySelector("h1")?.textContent).toBe("Notes from the books that stayed.");
    expect(host.querySelector('.rs-entry-link[href="/book-reviews/deep-work"]')).not.toBeNull();
    expect(host.textContent).toContain("Rated 4 of 5");
    // The date is the reading date, so the line must not claim it is when the review was added (DESIGN.md).
    expect(host.textContent).toContain("Most recent read: Deep Work, 10 Mar 2024.");
    expect(host.textContent).not.toContain("Last review added");
    expect(host.querySelectorAll(".rs-entry").length).toBe(3);
    expect(host.querySelector('.rs-foot a[href="https://bookchaowalit.com/"]')?.textContent).toBe("More projects");
    expect(host.textContent).toContain("No cover art is attached.");
  });

  it("has a nothing-yet state", () => {
    const host = page(<HomeView reviews={[]} />);
    expect(host.querySelector(".rs-empty h2")?.textContent).toBe("No reviews yet");
    expect(host.querySelector(".rs-head .rs-button")).toBeNull();
  });
});

describe("full index", () => {
  it("lists every review with category chips and links each detail page", async () => {
    const host = page(await BookReviewsPage());
    expect(host.querySelector(".rs-count")?.textContent).toBe("3 reviews");
    expect(host.querySelector('.rs-nav a[aria-current="page"]')?.textContent).toBe("All reviews");
    for (const slug of ["deep-work", "atomic-habits", "the-pragmatic-programmer"]) expect(host.querySelector(`.rs-entry-link[href="/book-reviews/${slug}"]`)).not.toBeNull();
  });

  it("filters by category and ignores an unknown one", async () => {
    const host = page(<IndexView reviews={sample} category="tech" />);
    expect(texts(host, ".rs-chip")).toEqual(["All3", "tech2", "craft1"]);
    expect(host.querySelector('.rs-chip[aria-current="page"]')?.getAttribute("href")).toBe("/book-reviews?category=tech");
    expect(host.querySelector(".rs-count")?.textContent).toBe("Showing 2 of 3 reviews in tech");
    // An unknown ?category= is not rewritten, so it lands on the plain index; the view also ignores one.
    expect(page(<IndexView reviews={sample} category="nope" />).querySelector(".rs-count")?.textContent).toBe("3 reviews");
    expect(page(<IndexView reviews={[]} />).querySelector(".rs-empty h2")?.textContent).toBe("No reviews yet");
  });
});

describe("review page", () => {
  it("shows previous / next in index order and leaves out an empty ISBN", () => {
    const host = page(<ReviewView review={sample[1]} reviews={sample} />);
    expect(host.querySelector('.rs-pager a[rel="prev"]')?.getAttribute("href")).toBe("/book-reviews/b");
    expect(host.querySelector('.rs-pager a[rel="next"]')?.getAttribute("href")).toBe("/book-reviews/c");
    expect(host.textContent).not.toContain("ISBN");
    expect(page(<ReviewView review={{ ...sample[0], category: "" }} reviews={sample} />).querySelector(".rs-article-head .rs-tags")).toBeNull();
  });

  it("has metadata for a real review and none for a missing one", async () => {
    expect((await generateMetadata({ params: Promise.resolve({ slug: "deep-work" }) })).title).toBe("Deep Work by Cal Newport");
    expect(await generateMetadata({ params: Promise.resolve({ slug: "missing" }) })).toEqual({});
  });
});

describe("follow-ups", () => {
  it("keeps the category on review pages: links, Back and previous / next", async () => {
    const index = page(<IndexView reviews={sample} category="tech" />);
    expect(index.querySelector(".rs-entry-link")?.getAttribute("href")).toBe("/book-reviews/b?category=tech");
    const view = page(<ReviewView review={sample[0]} reviews={sample} category="tech" />);
    expect(view.querySelector(".rs-back")?.getAttribute("href")).toBe("/book-reviews?category=tech");
    expect(view.querySelector(".rs-back")?.textContent).toBe("← Reviews in tech");
    expect(view.querySelector('.rs-pager a[rel="next"]')?.getAttribute("href")).toBe("/book-reviews/c?category=tech");
    // A category the review is not in is ignored.
    const odd = page(await ReviewInCategoryPage({ params: Promise.resolve({ slug: "deep-work", category: "tech" }) }));
    expect(odd.querySelector(".rs-back")?.getAttribute("href")).toBe("/book-reviews");
  });

  it("gives each review its own share title, description and URL", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "deep-work" }) });
    expect(meta.openGraph).toMatchObject({ url: "https://bookreviews.bookchaowalit.com/book-reviews/deep-work", title: "Deep Work by Cal Newport", type: "article" });
    expect(meta.description).toBe("A personal review of Deep Work by Cal Newport, rated 4 of 5.");
  });

  it("links the footer to an MCP how-to page with the real tools", () => {
    expect(page(<HomeView reviews={sample} />).querySelector('.rs-foot a[href="/mcp"]')?.textContent).toBe("MCP API");
    const host = page(<McpPage />);
    expect([...host.querySelectorAll("tbody code")].map((c) => c.textContent)).toEqual(["get_reviews", "get_review", "search_reviews", "get_categories"]);
  });

  it("says /api/mcp is a custom JSON-RPC subset, not a full MCP server", () => {
    const text = page(<McpPage />).textContent ?? "";
    expect(text).not.toMatch(/answers Model Context Protocol/);
    expect(text).toContain("Not a full MCP server");
    expect(text).toContain("result.reviews");
    expect(text).toMatch(/standard MCP\s+clients expect/);
  });
});

describe("site files", () => {
  it("uses the site's own domain", async () => {
    expect((await sitemap()).map((u) => u.url)).toContain("https://bookreviews.bookchaowalit.com/book-reviews/deep-work");
    expect(robots().sitemap).toBe("https://bookreviews.bookchaowalit.com/sitemap.xml");
  });

  it("sends /more-projects to the main site with a permanent redirect", async () => {
    expect(await nextConfig.redirects!()).toContainEqual({ source: "/more-projects", destination: "https://bookchaowalit.com/", permanent: true });
  });
});

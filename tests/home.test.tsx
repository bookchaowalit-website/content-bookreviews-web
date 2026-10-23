import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import BookReviewsPage from "@/app/book-reviews/page";

describe("home page", () => {
  it("renders the latest review, the count and the no-covers notice", async () => {
    const html = renderToString(await Home());
    expect(html).toContain("Notes from the books that stayed.");
    expect(html).toContain("<strong>3</strong> recorded reviews");
    expect(html).toContain('href="/book-reviews/deep-work"');
    expect(html).toContain("4 out of 5");
    expect(html).toContain("Covers are not attached in this archive.");
  });
});

describe("full index", () => {
  it("lists every review with its rating and links each detail page", async () => {
    const html = renderToString(await BookReviewsPage());
    expect(html).toContain("FULL INDEX / <!-- -->3");
    for (const slug of ["deep-work", "atomic-habits", "the-pragmatic-programmer"]) expect(html).toContain(`href="/book-reviews/${slug}"`);
    expect(html).toContain("No cover art is attached");
  });
});

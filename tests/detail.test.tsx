import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import BookReviewPage, { generateStaticParams } from "@/app/book-reviews/[slug]/page";

async function render(slug: string) {
  // Next 16 passes params as a Promise.
  return renderToString(await BookReviewPage({ params: Promise.resolve({ slug }) }));
}

describe("book review detail page", () => {
  it("renders the review for a real slug (Next 16 passes params as a Promise)", async () => {
    const html = await render("deep-work");
    expect(html).toContain("Deep Work");
    expect(html).toContain("Cal Newport");
  });

  it("renders markdown as elements, not raw markdown text", async () => {
    const html = await render("deep-work");
    expect(html).toContain("<strong>Key Takeaways:</strong>");
    expect(html).toContain("<li>Deep work creates high value in our economy</li>");
    expect(html).not.toContain("**Key Takeaways");
    expect(html).not.toContain("- Deep work creates");
  });

  it("calls notFound for an unknown or path-like slug", async () => {
    await expect(render("no-such-book")).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(render("../../package")).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("pre-renders every review in content/book-reviews", async () => {
    const params = await generateStaticParams();
    expect(params.map((p) => p.slug).sort()).toEqual(["atomic-habits", "deep-work", "the-pragmatic-programmer"]);
  });
});

import { describe, expect, it } from "vitest";
import { categoriesOf, filterReviews, getBookReviewBySlug, isValidSlug, sortNewestFirst, toReview, type BookReview } from "@/lib/mdx";

const review = (slug: string, date: string, extra: Partial<BookReview> = {}): BookReview => ({
  slug, title: slug, author: "A", rating: 3, category: "tech", date, isbn: "", content: "", ...extra,
});

describe("toReview", () => {
  it("coerces YAML dates and numbers to the declared types", () => {
    const r = toReview("x", "---\ntitle: X\nauthor: Y\nrating: '4'\ncategory: tech\ndate: 2024-03-10\nisbn: 978\n---\n\nBody\n");
    expect(r.date).toBe("2024-03-10");
    expect(r.rating).toBe(4);
    expect(r.isbn).toBe("978");
    expect(r.content).toBe("Body");
  });

  it("clamps ratings to 0..5 and falls back to the slug for a missing title", () => {
    expect(toReview("no-title", "---\nrating: 9\n---\n").rating).toBe(5);
    expect(toReview("no-title", "---\nrating: nope\n---\n").rating).toBe(0);
    expect(toReview("no-title", "---\n---\n").title).toBe("no-title");
  });
});

describe("sorting, filtering and categories", () => {
  const all = [review("b", "2024-01-15"), review("a", "2024-03-10", { author: "Cal Newport", category: "non-fiction" }), review("c", "2024-03-10", { content: "habit loop" })];

  it("sorts newest first, then by slug for ties", () => {
    expect(sortNewestFirst(all).map((r) => r.slug)).toEqual(["a", "c", "b"]);
  });

  it("filters case-insensitively across title, author, category and note text; blank query keeps all", () => {
    expect(filterReviews(all, "NEWPORT").map((r) => r.slug)).toEqual(["a"]);
    expect(filterReviews(all, "habit").map((r) => r.slug)).toEqual(["c"]);
    expect(filterReviews(all, "  ")).toHaveLength(3);
  });

  it("lists each category once", () => {
    expect(categoriesOf(all)).toEqual(["tech", "non-fiction"]);
  });
});

describe("slugs", () => {
  it("accepts kebab-case slugs only", () => {
    expect(isValidSlug("deep-work")).toBe(true);
    for (const bad of ["../package", "Deep-Work", "a/b", "", undefined, 3]) expect(isValidSlug(bad)).toBe(false);
  });

  it("returns null for a missing file or a path-like slug without reading outside content/", async () => {
    expect(await getBookReviewBySlug("missing")).toBeNull();
    expect(await getBookReviewBySlug("../../package")).toBeNull();
  });
});

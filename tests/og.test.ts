import { describe, expect, it, vi } from "vitest";
import { metadata } from "@/app/layout";
import { OG_IMAGE, shareMetadata } from "@/lib/share";

vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font" }) }));

describe("social card", () => {
  it("puts the 1200x630 card on the root metadata", () => {
    expect(OG_IMAGE).toMatchObject({ url: "/og.png", width: 1200, height: 630 });
    expect(metadata.openGraph).toMatchObject({ images: [OG_IMAGE] });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", images: ["/og.png"] });
  });

  it("keeps the card on pages that set their own share data", () => {
    const page = shareMetadata("/x/", "Page", "About the page");
    expect(page.openGraph).toMatchObject({ title: "Page", images: [OG_IMAGE] });
    expect(page.twitter).toMatchObject({ card: "summary_large_image", title: "Page", images: ["/og.png"] });
  });
});

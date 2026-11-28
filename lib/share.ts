import type { Metadata } from "next";

// Share data per page: Next replaces a parent's openGraph / twitter objects instead of merging them, so every
// page that is not the home page sets its own, or a shared link would preview as the home page.

import { SITE } from "@/components/review-views";

// Shared 1200x630 social card (public/og.png, made with the `art` CLI card template). SITE is a fixed public https
// origin, so the image URL Next builds from metadataBase is always one link-preview crawlers can fetch.
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "Book Reviews — Chaowalit Greepoke" } as const;
export const SOCIAL_CARD = {
  openGraph: { images: [OG_IMAGE] },
  twitter: { card: "summary_large_image" as const, images: [OG_IMAGE.url] },
};

export function shareMetadata(path: string, title: string, description: string, type: "website" | "article" = "website"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, url: `${SITE}${path}`, title, description, siteName: "Book Reviews", ...SOCIAL_CARD.openGraph },
    twitter: { title, description, ...SOCIAL_CARD.twitter },
  };
}

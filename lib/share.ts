import type { Metadata } from "next";

// Share data per page: Next replaces a parent's openGraph / twitter objects instead of merging them, so every
// page that is not the home page sets its own, or a shared link would preview as the home page.

import { SITE } from "@/components/review-views";

export function shareMetadata(path: string, title: string, description: string, type: "website" | "article" = "website"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, url: `${SITE}${path}`, title, description, siteName: "Book Reviews" },
    twitter: { card: "summary", title, description },
  };
}

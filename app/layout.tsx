import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SITE } from "@/components/review-views";
import { SOCIAL_CARD } from "@/lib/share";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const title = "Book Reviews — Chaowalit Greepoke";
const description = "A small reading ledger across habits, craft and focused work: dated personal notes, not recommendations.";

export const metadata: Metadata = {
  title: { default: title, template: "%s — Book Reviews" },
  description,
  authors: [{ name: "Chaowalit Greepoke (Book)", url: "https://bookchaowalit.com" }],
  creator: "Chaowalit Greepoke (Book)",
  metadataBase: new URL(SITE),
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE, title, description, siteName: "Book Reviews", ...SOCIAL_CARD.openGraph },
  twitter: SOCIAL_CARD.twitter,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The font variable sits on <html>: the Reader shell tokens live on :root and read it from there.
  return <html lang="en" className={geistSans.variable}><body>{children}</body></html>;
}

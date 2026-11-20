import type { NextConfig } from "next";
import { categoryRewrites } from "./lib/category-routes";

const nextConfig: NextConfig = {
  // The MCP route reads content/book-reviews/*.mdx at request time; ship the files with the function.
  outputFileTracingIncludes: { "/api/mcp": ["./content/**"] },
  async redirects() {
    // The old per-app portfolio list now lives on the main site (permanent: Next answers 308).
    return [{ source: "/more-projects", destination: "https://bookchaowalit.com/", permanent: true }];
  },
  async rewrites() {
    // ?category= links are served from pre-rendered pages (lib/category-routes.ts), so no page reads searchParams.
    return { beforeFiles: await categoryRewrites(), afterFiles: [], fallback: [] };
  },
};

export default nextConfig;

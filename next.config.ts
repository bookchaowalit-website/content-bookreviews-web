import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The MCP route reads content/book-reviews/*.mdx at request time; ship the files with the function.
  outputFileTracingIncludes: { "/api/mcp": ["./content/**"] },
  async redirects() {
    // The old per-app portfolio list now lives on the main site (permanent: Next answers 308).
    return [{ source: "/more-projects", destination: "https://bookchaowalit.com/", permanent: true }];
  },
};

export default nextConfig;

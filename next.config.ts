import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The MCP route reads content/book-reviews/*.mdx at request time; ship the files with the function.
  outputFileTracingIncludes: { "/api/mcp": ["./content/**"] },
};

export default nextConfig;

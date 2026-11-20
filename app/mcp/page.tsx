import type { Metadata } from "next";
import { McpDocs } from "@/components/mcp-docs";
import { ReviewFrame, SITE } from "@/components/review-views";
import { TOOLS } from "@/lib/mcp-tools";
import { shareMetadata } from "@/lib/share";

export const metadata: Metadata = shareMetadata("/mcp", "MCP API", "How to call the Book Reviews read-only MCP endpoint.");

export default function McpPage() {
  return <ReviewFrame><McpDocs name="Book Reviews" site={SITE} tools={TOOLS} /></ReviewFrame>;
}

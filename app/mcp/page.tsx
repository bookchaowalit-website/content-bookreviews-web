import type { Metadata } from "next";
import { McpDocs } from "@/components/mcp-docs";
import { ReviewFrame, SITE } from "@/components/review-views";
import { TOOLS } from "@/lib/mcp-tools";

export const metadata: Metadata = { title: "MCP API", description: "How to call the Book Reviews read-only MCP endpoint.", alternates: { canonical: "/mcp" } };

export default function McpPage() {
  return <ReviewFrame><McpDocs name="Book Reviews" site={SITE} tools={TOOLS} /></ReviewFrame>;
}

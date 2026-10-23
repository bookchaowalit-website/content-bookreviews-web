import { NextResponse } from "next/server";
import { categoriesOf, getAllBookReviews, getBookReviewBySlug, filterReviews } from "@/lib/mdx";

// Stateless JSON-RPC MCP endpoint over the same MDX reviews the pages render (content/book-reviews). Read only.

type RpcRequest = { id?: number | string | null; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } };

const TOOLS = [
  { name: "get_reviews", description: "List every book review, newest first", inputSchema: { type: "object", properties: { category: { type: "string", description: "Only reviews in this category" } } } },
  { name: "get_review", description: "Get one book review by slug", inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] } },
  { name: "search_reviews", description: "Search titles, authors, categories and note text", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
  { name: "get_categories", description: "List the categories used by the reviews", inputSchema: { type: "object", properties: {} } },
];

class RpcError extends Error {
  constructor(readonly code: number, message: string) {
    super(message);
  }
}

async function callTool(name: string | undefined, args: Record<string, unknown> = {}) {
  switch (name) {
    case "get_reviews": {
      const reviews = await getAllBookReviews();
      return { reviews: typeof args.category === "string" ? reviews.filter((r) => r.category === args.category) : reviews };
    }
    case "get_review": {
      const review = await getBookReviewBySlug(args.slug);
      if (!review) throw new RpcError(-32602, `No book review with slug ${String(args.slug)}`);
      return { review };
    }
    case "search_reviews":
      if (typeof args.query !== "string") throw new RpcError(-32602, "query must be a string");
      return { reviews: filterReviews(await getAllBookReviews(), args.query) };
    case "get_categories":
      return { categories: categoriesOf(await getAllBookReviews()) };
    default:
      throw new RpcError(-32602, `Unknown tool: ${String(name)}`);
  }
}

export async function POST(request: Request) {
  let id: RpcRequest["id"] = null;
  let body: RpcRequest;
  try {
    body = (await request.json()) as RpcRequest;
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }
  id = body.id ?? null;
  try {
    let result: unknown;
    switch (body.method) {
      case "initialize":
        result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "Book Reviews", version: "1.0.0" } };
        break;
      case "tools/list":
        result = { tools: TOOLS };
        break;
      case "tools/call":
        result = await callTool(body.params?.name, body.params?.arguments);
        break;
      default:
        throw new RpcError(-32601, `Unknown method: ${String(body.method)}`);
    }
    return NextResponse.json({ jsonrpc: "2.0", id, result });
  } catch (error) {
    if (error instanceof RpcError) return NextResponse.json({ jsonrpc: "2.0", id, error: { code: error.code, message: error.message } }, { status: 400 });
    return NextResponse.json({ jsonrpc: "2.0", id, error: { code: -32603, message: "Internal error" } }, { status: 500 });
  }
}

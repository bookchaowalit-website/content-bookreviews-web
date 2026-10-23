import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/mcp/route";

function rpc(body: unknown) {
  return POST(new Request("http://localhost/api/mcp", { method: "POST", body: JSON.stringify(body) }));
}

describe("MCP route", () => {
  it("echoes the JSON-RPC request id", async () => {
    const res = await rpc({ jsonrpc: "2.0", id: 7, method: "tools/list" });
    expect((await res.json()).id).toBe(7);
  });

  it("get_reviews returns the real reviews, newest first", async () => {
    const res = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_reviews" } });
    const { result } = await res.json();
    expect(result.reviews.map((r: { slug: string }) => r.slug)).toEqual(["deep-work", "atomic-habits", "the-pragmatic-programmer"]);
  });

  it("get_review returns one review by slug, and an error for an unknown slug", async () => {
    const ok = await (await rpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_review", arguments: { slug: "atomic-habits" } } })).json();
    expect(ok.result.review.author).toBe("James Clear");
    const missing = await (await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_review", arguments: { slug: "nope" } } })).json();
    expect(missing.error.code).toBe(-32602);
    expect(missing.id).toBe(3);
  });

  it("search_reviews matches title, author, category or note text", async () => {
    const { result } = await (await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "search_reviews", arguments: { query: "newport" } } })).json();
    expect(result.reviews.map((r: { slug: string }) => r.slug)).toEqual(["deep-work"]);
  });

  it("get_categories lists the categories in the content", async () => {
    const { result } = await (await rpc({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "get_categories" } })).json();
    expect([...result.categories].sort()).toEqual([...new Set(result.categories)].sort());
    expect(result.categories).toContain("non-fiction");
  });

  it("rejects an unknown tool or method instead of pretending to call it", async () => {
    const tool = await (await rpc({ jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "delete_all" } })).json();
    expect(tool.error.code).toBe(-32602);
    const method = await (await rpc({ jsonrpc: "2.0", id: 8, method: "resources/list" })).json();
    expect(method.error.code).toBe(-32601);
    expect(method.id).toBe(8);
  });
});

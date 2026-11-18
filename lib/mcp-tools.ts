// The MCP tools /api/mcp serves; the /mcp page documents the same list.

export const TOOLS = [
  { name: "get_reviews", description: "List every book review, newest first", inputSchema: { type: "object", properties: { category: { type: "string", description: "Only reviews in this category" } } } },
  { name: "get_review", description: "Get one book review by slug", inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] } },
  { name: "search_reviews", description: "Search titles, authors, categories and note text", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
  { name: "get_categories", description: "List the categories used by the reviews", inputSchema: { type: "object", properties: {} } },
];

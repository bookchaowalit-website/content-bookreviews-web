# 01 — Business process (As-Is / To-Be)

content-bookreviews-web คือสมุดบันทึกรีวิวหนังสืออ่านอย่างเดียว (Next.js, bookreviews.bookchaowalit.com) ที่อ่านรีวิว 3 เรื่องจากไฟล์ใน `content/book-reviews/` ให้ผู้เยี่ยมชม portfolio และให้ client MCP อ่านข้อมูลชุดเดียวกัน ไม่มีบัญชี ฐานข้อมูล หรือการเขียนข้อมูล

Last reviewed: 2026-11-28 · commit `d0044f2`

## As-Is (จากโค้ดวันนี้)

```mermaid
flowchart LR
  AUTHOR["owner/AI แก้ content/book-reviews/*.mdx"] --> PR["push / PR"]
  PR --> CI["CI: lint, typecheck, tests (shared 85% + vitest lines 90%), build, security scan (ตรวจอย่างเดียว ไม่ deploy)"]
  OWNER["owner รัน Vercel CLI"] --> DEPLOY["Vercel production: pre-render หน้า home, list, detail, category"]
  PR -.->|"Git deploy บน push main [ต้องยืนยัน]"| DEPLOY
  READER["ผู้อ่าน"] --> PAGES["/, /book-reviews, /book-reviews/slug"]
  DEPLOY --> PAGES
  PAGES -->|"?category= ที่รู้จัก (หน้ารายการ/รายละเอียด)"| CAT["rewrite เป็นหน้า pre-render"]
  PAGES -->|"เฉพาะ /book-reviews/slug"| SLUG{"slug เป็น kebab-case และมีไฟล์?"}
  SLUG -->|no| NF["404"]
  SLUG -->|yes| MD["lib/markdown.tsx แปลง markdown เป็น React (HTML แสดงเป็นข้อความ)"]
  PAGES -->|error| SENTRY["Sentry (ถ้ามี DSN; beforeSend ลบ request/user/breadcrumbs/extra, เก็บเฉพาะ contexts ของแพลตฟอร์ม, ตัด ?query/#hash ในข้อความ/ชื่อไฟล์/transaction)"]
  CLIENT["MCP client"] --> MCP["POST /api/mcp (Node, JSON-RPC)"]
  MCP --> TOOLS["get_reviews, get_review, search_reviews, get_categories"]
  MCP -->|"JSON ผิด"| E1["-32700, 400"]
  MCP -->|"tool/method/slug ไม่รู้จัก"| E2["JSON-RPC error, 400"]
  TOOLS --> FILES["อ่านไฟล์ content/book-reviews เดียวกับหน้าเว็บ"]
```

Sources: `lib/mdx.ts`, `lib/markdown.tsx`, `app/api/mcp/route.ts`, `lib/mcp-tools.ts`, `next.config.ts`, `app/book-reviews/[slug]/page.tsx`, `lib/sentry.ts`, `.github/workflows/ci.yml`, `README.md`, `PRODUCT.md`

หมายเหตุ: `PRODUCT.md` (2026-10-23) บันทึกว่า Vercel Git link ยังชี้ชื่อรีโปเก่า จึง deploy ด้วย CLI เท่านั้น นี่เป็นสถานะล่าสุดที่บันทึกไว้; ไม่มีไฟล์ใน repo ที่ยืนยันสถานะปัจจุบัน [ต้องยืนยัน]

## To-Be

ไม่มี To-Be ที่เขียนไว้ (`PRODUCT.md` ระบุเฉพาะสิ่งที่ยังไม่ทำและห้ามอ้าง เช่น reading-status, search UI ไม่มีเป้าหมายใหม่)

## Gap

| ID | As-Is → To-Be | Status | Owner | Evidence |
|---|---|---|---|---|
| G1 | ไม่มี To-Be ของกระบวนการ → owner กำหนดว่าจะเพิ่มความสามารถใด (เช่น search UI, สถานะการอ่าน) หรือคงเป็น ledger อ่านอย่างเดียว | decide | owner | ไม่มีใน `PRODUCT.md` / `specs/` |
| G2 | push เข้า main ไม่ deploy ตามสถานะที่บันทึก 2026-10-23 (Vercel Git link ชี้รีโปเก่า) → ตรวจ Git link และ commit ที่ production รันก่อน แล้วค่อยผูก Vercel Git กับรีโปปัจจุบันถ้ายังไม่ผูก [ต้องยืนยัน] | decide | owner | `PRODUCT.md` §Live URL and deploy state (owner action D9) |

## Open questions

- Production รัน commit ไหนในตอนนี้ และ Git link ถูกแก้แล้วหรือยัง

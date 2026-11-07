// Run: node src/lib/blocks.check.ts   (fails loudly if validation regresses)
import assert from "node:assert/strict";
import { DEFAULT_PAGES, safeHref, sanitizeBlocks } from "./blocks.ts";

assert.equal(safeHref("javascript:alert(1)"), "");
assert.equal(safeHref("//evil.com"), "");
assert.equal(safeHref("http://insecure.com"), "");
assert.equal(safeHref("/about"), "/about");
assert.equal(safeHref("https://ok.com"), "https://ok.com");
assert.equal(safeHref("mailto:a@b.co"), "mailto:a@b.co");

const out = sanitizeBlocks([
  { id: "x y!", type: "cta", data: { heading: "H", cta: "Go", href: "javascript:1", wave: "yes", evil: "<script>" } },
  { id: "2", type: "not-a-block", data: {} },
  { id: "3", type: "banner", data: { image: "javascript:1", size: "huge" } },
  { id: "4", type: "faq", data: { items: [{ q: "q", a: "a", extra: "z" }, "junk"] } },
]);
assert.equal(out.length, 3, "unknown block types are dropped");
assert.equal(out[0].id, "xy");
assert.equal(out[0].data.href, "", "unsafe link removed");
assert.equal(out[0].data.wave, "1");
assert.ok(!("evil" in out[0].data), "unknown fields dropped");
assert.equal(out[1].data.image, "", "non-https image removed");
assert.equal(out[1].data.size, "tall", "bad select falls back to first option");
assert.deepEqual(out[2].data.items, [{ q: "q", a: "a" }, { q: "", a: "" }]);
assert.equal(sanitizeBlocks("garbage").length, 0);
assert.equal(sanitizeBlocks(Array.from({ length: 100 }, () => ({ type: "text", data: {} }))).length, 40, "max 40 blocks");

// every built-in page must survive its own validation unchanged
for (const p of DEFAULT_PAGES) assert.deepEqual(sanitizeBlocks(p.blocks), p.blocks, `default page ${p.slug} is valid`);
console.log("blocks ok");

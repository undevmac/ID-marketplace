// Run: node src/lib/blocks.check.ts   (fails loudly if validation regresses)
import assert from "node:assert/strict";
import { DEFAULT_PAGES, categoryPage, safeHref, sanitizeBlocks } from "./blocks.ts";
import { splitBrand } from "./split-brand.ts";

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
// category page filter: valid slug kept, anything else falls back to "all"
const pf = (category: string) => sanitizeBlocks([{ id: "p", type: "products", data: { category } }])[0].data.category;
assert.equal(pf("lanyards"), "lanyards");
assert.equal(pf("../x"), "all");
assert.equal(pf("<script>"), "all");

// auto-generated pages for any category (including brand-new ones) must also be valid
for (const slug of ["lanyards", "prop-cards", "staff-badges"]) {
  const p = categoryPage({ slug, label: "Label", description: "d" });
  assert.deepEqual(sanitizeBlocks(p.blocks), p.blocks, `category page ${slug} is valid`);
  assert.equal(p.blocks.find((b) => b.type === "products")!.data.category, slug, "page lists its own category");
}
// two-tone logo splitting for any site name
assert.deepEqual(splitBrand("BadgeWorks"), ["Badge", "Works"]);
assert.deepEqual(splitBrand("Acme Cards"), ["Acme ", "Cards"]);
assert.deepEqual(splitBrand("My Big Shop"), ["My Big ", "Shop"]);
assert.deepEqual(splitBrand("Acme"), ["Acme", ""]);
assert.deepEqual(splitBrand("  Spaced Name  "), ["Spaced ", "Name"]);
// pages saved before a setting existed pick up that setting's default (old home page -> tiles follow categories)
const old = sanitizeBlocks([{ id: "c", type: "categories", data: { title: "Shop", tiles: [{ title: "Old tile", blurb: "", href: "/x", image: "" }] } }])[0];
assert.equal(old.data.auto, "1", "missing auto setting defaults to on");
const off = sanitizeBlocks([{ id: "c", type: "categories", data: { title: "Shop", auto: "", tiles: [] } }])[0];
assert.equal(off.data.auto, "", "an explicit off is respected");
console.log("blocks ok");

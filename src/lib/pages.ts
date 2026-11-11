import { connection } from "next/server";
import { admin } from "./supabase";
import { DEFAULT_PAGES, categoryPage, sanitizeBlocks, type Page } from "./blocks";
import { listCategories } from "./categories";

type Row = { slug: string; title: string; nav: boolean; published: boolean; blocks: unknown };
const toPage = (r: Row): Page => ({ slug: r.slug, title: r.title, nav: r.nav, published: r.published, blocks: sanitizeBlocks(r.blocks) });

// ponytail: reads use the service key (server only) so an unpublished DB row can hide a built-in page.
async function rows(): Promise<Row[]> {
  try {
    const { data } = await admin().from("bw_pages").select("slug,title,nav,published,blocks");
    return (data as Row[]) ?? [];
  } catch { return []; } // DB unreachable -> defaults still render
}

// Order: home, one page per category, other built-in pages, custom pages.
// A saved row overrides the default with the same slug. Category pages exist exactly as long as the category does.
export async function listPages(): Promise<Page[]> {
  await connection();
  const [rs, cats] = await Promise.all([rows(), listCategories()]);
  const saved = new Map(rs.map((r) => [r.slug, toPage(r)]));
  const builtin = DEFAULT_PAGES.map((p): Page => ({ ...(saved.get(p.slug) ?? p), origin: "builtin" }));
  const catPages = cats.map((c): Page => ({ ...(saved.get(c.slug) ?? categoryPage(c)), origin: "category" }));
  const known = new Set([...builtin, ...catPages].map((p) => p.slug));
  const custom = [...saved.values()].filter((p) => !known.has(p.slug)).sort((a, b) => a.title.localeCompare(b.title)).map((p): Page => ({ ...p, origin: "custom" }));
  return [builtin[0], ...catPages, ...builtin.slice(1), ...custom];
}

export async function getPage(slug: string, opts?: { preview?: boolean }): Promise<Page | null> {
  const p = (await listPages()).find((x) => x.slug === slug);
  return p && (p.published || opts?.preview) ? p : null;
}

export async function getNav() {
  return (await listPages()).filter((p) => p.nav && p.published && p.slug !== "home").map((p) => ({ slug: p.slug, title: p.title, origin: p.origin }));
}

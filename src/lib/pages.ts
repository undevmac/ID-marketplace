import { connection } from "next/server";
import { admin } from "./supabase";
import { DEFAULTS, DEFAULT_PAGES, sanitizeBlocks, type Page } from "./blocks";

type Row = { slug: string; title: string; nav: boolean; published: boolean; blocks: unknown };
const toPage = (r: Row): Page => ({ slug: r.slug, title: r.title, nav: r.nav, published: r.published, blocks: sanitizeBlocks(r.blocks) });

// ponytail: reads use the service key (server only) so an unpublished DB row can hide a default page.
async function rows(): Promise<Row[]> {
  try {
    const { data } = await admin().from("bw_pages").select("slug,title,nav,published,blocks");
    return (data as Row[]) ?? [];
  } catch { return []; } // DB unreachable -> defaults still render
}

// A saved row overrides the built-in default with the same slug.
export async function listPages(): Promise<Page[]> {
  await connection();
  const db = new Map((await rows()).map((r) => [r.slug, toPage(r)]));
  const defaults = DEFAULT_PAGES.map((d) => db.get(d.slug) ?? d);
  const custom = [...db.values()].filter((p) => !DEFAULTS[p.slug]).sort((a, b) => a.title.localeCompare(b.title));
  return [...defaults, ...custom];
}

export async function getPage(slug: string, opts?: { preview?: boolean }): Promise<Page | null> {
  const p = (await listPages()).find((x) => x.slug === slug);
  return p && (p.published || opts?.preview) ? p : null;
}

export async function getNav() {
  return (await listPages()).filter((p) => p.nav && p.published && p.slug !== "home").map((p) => ({ slug: p.slug, title: p.title }));
}

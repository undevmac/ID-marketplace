"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin, db } from "@/lib/supabase";
import { COOKIE, getAdmin } from "@/lib/auth";
import { FIELDS } from "@/lib/content";
import { CATEGORIES, DEFAULTS, PROP_CATEGORY, RESERVED, sanitizeBlocks } from "@/lib/blocks";

type R = { msg?: string; error?: string } | undefined;
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const okImage = (v: string) => v === "" || /^https:\/\//.test(v);

export async function login(_: R, fd: FormData): Promise<R> {
  const { data, error } = await db().auth.signInWithPassword({ email: s(fd, "email"), password: String(fd.get("password") ?? "") });
  if (error || !data.session) return { error: "Invalid email or password." };
  (await cookies()).set(COOKIE, data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: data.session.expires_in });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/admin/login");
}

export async function saveContent(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return { error: "Session expired. Log in again." };
  const rows = FIELDS.filter((f) => fd.has(f.key)).map((f) => ({ key: f.key, value: s(fd, f.key).slice(0, 2000), updated_at: new Date().toISOString() }));
  if (rows.some((r) => FIELDS.find((f) => f.key === r.key)!.kind === "image" && !okImage(r.value))) return { error: "Invalid image URL." };
  const { error } = await admin().from("bw_content").upsert(rows);
  return error ? { error: "Could not save." } : { msg: "Saved ✓" };
}

export async function saveProduct(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return { error: "Session expired. Log in again." };
  const id = s(fd, "id"), name = s(fd, "name"), price = Math.round(parseFloat(s(fd, "price")) * 100), image = s(fd, "image"), category = s(fd, "category");
  if (!name || !(price > 0 && price <= 10_000_000)) return { error: "Name and a price above 0 are required." };
  if (!okImage(image)) return { error: "Invalid image URL." };
  if (!CATEGORIES.some((c) => c[0] === category)) return { error: "Choose a category." };
  // kind follows category, so anything in Prop cards always carries the PROP watermark
  const row = { name: name.slice(0, 120), description: s(fd, "description").slice(0, 1000), price_cents: price, image, badge: s(fd, "badge").slice(0, 20) || null, active: fd.get("active") === "on", category, kind: category === PROP_CATEGORY ? "prop" : "badge" };
  const sb = admin();
  if (id) {
    const { error } = await sb.from("bw_products").update(row).eq("id", id);
    return error ? { error: "Could not save." } : { msg: "Saved ✓" };
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);
  const { error } = await sb.from("bw_products").insert({ ...row, slug });
  if (error) return { error: "Could not add product." };
  redirect("/admin");
}

const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export async function savePage(input: { slug: string; title: string; nav: boolean; published: boolean; blocks: unknown }): Promise<R> {
  if (!(await getAdmin())) return { error: "Session expired. Log in again." };
  const slug = slugify(String(input.slug));
  const title = String(input.title ?? "").trim().slice(0, 80);
  if (!slug || RESERVED.includes(slug) || !title) return { error: "A title is required." };
  const home = slug === "home";
  const { error } = await admin().from("bw_pages").upsert({ slug, title, nav: home ? false : !!input.nav, published: home ? true : !!input.published, blocks: sanitizeBlocks(input.blocks), updated_at: new Date().toISOString() });
  return error ? { error: "Could not save the page." } : { msg: "Saved ✓" };
}

export async function createPage(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return { error: "Session expired. Log in again." };
  const title = s(fd, "title").slice(0, 80), slug = slugify(title);
  if (!slug) return { error: "Give the page a title." };
  if (RESERVED.includes(slug) || DEFAULTS[slug]) return { error: "That URL is taken. Pick another title." };
  const sb = admin();
  const { data: ex } = await sb.from("bw_pages").select("slug").eq("slug", slug).maybeSingle();
  if (ex) return { error: "A page with that URL already exists." };
  const { error } = await sb.from("bw_pages").insert({ slug, title, nav: true, published: false, blocks: [] });
  if (error) return { error: "Could not create the page." };
  redirect(`/admin/pages/${slug}`);
}

// Custom page -> deleted. Built-in page -> its saved edits are removed and the default comes back.
export async function removePage(fd: FormData) {
  if (!(await getAdmin())) redirect("/admin/login");
  await admin().from("bw_pages").delete().eq("slug", slugify(s(fd, "slug")));
  redirect("/admin");
}

// Browser uploads straight to Storage with a one-time signed URL (avoids server-action body limits).
export async function signUpload(filename: string): Promise<{ path: string; token: string; url: string } | { error: string }> {
  if (!(await getAdmin())) return { error: "Session expired. Log in again." };
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) return { error: "Use a JPG, PNG, WebP, GIF or AVIF image." };
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await admin().storage.from("site").createSignedUploadUrl(path);
  if (error || !data) return { error: "Upload not available." };
  return { path, token: data.token, url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site/${path}` };
}

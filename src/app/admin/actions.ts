"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { admin, db } from "@/lib/supabase";
import { COOKIE, getAdmin } from "@/lib/auth";
import { FIELDS } from "@/lib/content";
import { RESERVED, sanitizeBlocks } from "@/lib/blocks";
import { listPages } from "@/lib/pages";
import { ORDER_STATUSES } from "@/lib/orders";

type R = { msg?: string; error?: string } | undefined;
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const okImage = (v: string) => v === "" || /^https:\/\//.test(v);
const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
const EXPIRED: R = { error: "Session expired. Log in again." };
// Reserved words, built-in pages, categories and custom pages all share one URL space.
const slugTaken = async (slug: string) => RESERVED.includes(slug) || (await listPages()).some((p) => p.slug === slug);

// ---------- auth ----------
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

// ---------- settings ----------
export async function saveContent(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const rows = FIELDS.filter((f) => fd.has(f.key)).map((f) => ({ key: f.key, value: s(fd, f.key).slice(0, 2000), updated_at: new Date().toISOString() }));
  const { error } = await admin().from("bw_content").upsert(rows);
  return error ? { error: "Could not save." } : { msg: "Saved ✓" };
}

// ---------- products ----------
export async function saveProduct(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const id = s(fd, "id"), name = s(fd, "name"), price = Math.round(parseFloat(s(fd, "price")) * 100), image = s(fd, "image"), category = s(fd, "category");
  if (!name || !(price > 0 && price <= 10_000_000)) return { error: "Name and a price above 0 are required." };
  if (!okImage(image)) return { error: "Invalid image URL." };
  const sb = admin();
  const { data: cat } = await sb.from("bw_categories").select("slug,is_prop").eq("slug", category).maybeSingle();
  if (!cat) return { error: "Choose a category (create one first if there are none)." };
  // kind follows the category, so anything in a prop category always carries the PROP watermark
  const row = { name: name.slice(0, 120), description: s(fd, "description").slice(0, 1000), price_cents: price, image, badge: s(fd, "badge").slice(0, 20) || null, active: fd.get("active") === "on", category, kind: cat.is_prop ? "prop" : "badge" };
  if (id) {
    const { error } = await sb.from("bw_products").update(row).eq("id", id);
    if (error) return { error: "Could not save." };
    revalidatePath("/admin/products");
    return { msg: "Saved ✓" };
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);
  const { error } = await sb.from("bw_products").insert({ ...row, slug });
  if (error) return { error: "Could not add product." };
  redirect("/admin/products");
}

// Products customers have ordered can only be hidden (order history keeps pointing at them).
export async function deleteProduct(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const id = s(fd, "id"), sb = admin();
  const { count } = await sb.from("bw_order_items").select("id", { count: "exact", head: true }).eq("product_id", id);
  if (count) return { error: `Ordered ${count} time${count > 1 ? "s" : ""} before, so it can't be deleted. Untick "Visible in store" to hide it instead.` };
  const { error } = await sb.from("bw_products").delete().eq("id", id);
  if (error) return { error: "Could not delete." };
  redirect("/admin/products");
}

// ---------- categories ----------
export async function createCategory(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const label = s(fd, "label").slice(0, 60), slug = slugify(label), image = s(fd, "image");
  if (!slug) return { error: "Give the category a name." };
  if (!okImage(image)) return { error: "Invalid image URL." };
  if (await slugTaken(slug)) return { error: `The address /${slug} is already used by another page. Choose a different name.` };
  const sb = admin();
  const { data: last } = await sb.from("bw_categories").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
  const { error } = await sb.from("bw_categories").insert({ slug, label, description: s(fd, "description").slice(0, 300), image, is_prop: fd.get("is_prop") === "on", sort: (last?.sort ?? 0) + 10 });
  if (error) return { error: "Could not add the category." };
  revalidatePath("/admin/categories");
  return { msg: `Added. Its page is live at /${slug}` };
}

export async function updateCategory(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const slug = s(fd, "slug"), label = s(fd, "label").slice(0, 60), image = s(fd, "image"), isProp = fd.get("is_prop") === "on";
  if (!label) return { error: "Name is required." };
  if (!okImage(image)) return { error: "Invalid image URL." };
  const sb = admin();
  const { error } = await sb.from("bw_categories").update({ label, description: s(fd, "description").slice(0, 300), image, is_prop: isProp }).eq("slug", slug);
  if (error) return { error: "Could not save." };
  // keep the watermark rule in sync for products already in this category
  await sb.from("bw_products").update({ kind: isProp ? "prop" : "badge" }).eq("category", slug);
  revalidatePath("/admin/categories");
  return { msg: "Saved ✓" };
}

export async function deleteCategory(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const slug = s(fd, "slug"), sb = admin();
  const { data: prods } = await sb.from("bw_products").select("name").eq("category", slug).limit(5);
  if (prods?.length) {
    const { count } = await sb.from("bw_products").select("id", { count: "exact", head: true }).eq("category", slug);
    return { error: `Still has ${count} product${count === 1 ? "" : "s"} (${prods.map((p) => p.name).join(", ")}${(count ?? 0) > prods.length ? ", …" : ""}). Move or delete them first.` };
  }
  await sb.from("bw_pages").delete().eq("slug", slug); // its saved page edits go too
  const { error } = await sb.from("bw_categories").delete().eq("slug", slug);
  if (error) return { error: "Could not delete (it may still have products)." };
  revalidatePath("/admin/categories");
  return { msg: "Deleted" };
}

// ---------- pages ----------
export async function savePage(input: { slug: string; title: string; nav: boolean; published: boolean; blocks: unknown }): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const slug = slugify(String(input.slug));
  const title = String(input.title ?? "").trim().slice(0, 80);
  if (!slug || RESERVED.includes(slug) || !title) return { error: "A title is required." };
  const home = slug === "home";
  const { error } = await admin().from("bw_pages").upsert({ slug, title, nav: home ? false : !!input.nav, published: home ? true : !!input.published, blocks: sanitizeBlocks(input.blocks), updated_at: new Date().toISOString() });
  return error ? { error: "Could not save the page." } : { msg: "Saved ✓" };
}

export async function createPage(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const title = s(fd, "title").slice(0, 80), slug = slugify(title);
  if (!slug) return { error: "Give the page a title." };
  if (await slugTaken(slug)) return { error: `The address /${slug} is already used. Pick another title.` };
  const { error } = await admin().from("bw_pages").insert({ slug, title, nav: true, published: false, blocks: [] });
  if (error) return { error: "Could not create the page." };
  redirect(`/admin/pages/${slug}`);
}

// Custom page -> deleted. Built-in or category page -> its saved edits are removed and the default comes back.
export async function removePage(fd: FormData) {
  if (!(await getAdmin())) redirect("/admin/login");
  await admin().from("bw_pages").delete().eq("slug", slugify(s(fd, "slug")));
  redirect("/admin/pages");
}

// ---------- orders ----------
export async function setOrderStatus(_: R, fd: FormData): Promise<R> {
  if (!(await getAdmin())) return EXPIRED;
  const status = s(fd, "status");
  if (!ORDER_STATUSES.some((o) => o[0] === status)) return { error: "Unknown status." };
  const { error } = await admin().from("bw_orders").update({ status }).eq("id", s(fd, "id"));
  if (error) return { error: "Could not update." };
  revalidatePath("/admin/orders");
  return { msg: "Updated ✓" };
}

// Browser uploads straight to Storage with a one-time signed URL (avoids server-action body limits).
export async function signUpload(filename: string): Promise<{ path: string; token: string; url: string } | { error: string }> {
  if (!(await getAdmin())) return EXPIRED as { error: string };
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) return { error: "Use a JPG, PNG, WebP, GIF or AVIF image." };
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await admin().storage.from("site").createSignedUploadUrl(path);
  if (error || !data) return { error: "Upload not available." };
  return { path, token: data.token, url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site/${path}` };
}

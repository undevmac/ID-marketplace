"use server";
import { redirect } from "next/navigation";
import { admin } from "@/lib/supabase";

// Client sends only {slug, qty}. Prices and totals come from the DB here.
export async function placeOrder(_: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  const str = (k: string) => String(fd.get(k) ?? "").trim();
  const org = str("org"), name = str("name"), email = str("email"), notes = str("notes");
  let cart: { slug: string; qty: number }[] = [];
  try { cart = JSON.parse(str("cart")); } catch {}

  if (!org || !name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Please fill in organization, name and a valid email." };
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > 50) return { error: "Your cart is empty." };

  const sb = admin();
  const { data: prods } = await sb.from("bw_products").select("id,slug,price_cents").in("slug", cart.map((c) => String(c.slug))).eq("active", true);
  const bySlug = new Map((prods ?? []).map((p) => [p.slug, p]));
  const items = cart.flatMap((c) => {
    const p = bySlug.get(String(c.slug)); const qty = Math.floor(Number(c.qty));
    return p && qty >= 1 && qty <= 5000 ? [{ product_id: p.id, qty, unit_cents: p.price_cents }] : [];
  });
  if (items.length === 0) return { error: "Those items are no longer available." };

  const total = items.reduce((n, i) => n + i.qty * i.unit_cents, 0);
  const { data: order, error } = await sb.from("bw_orders").insert({ org_name: org, contact_name: name, email, notes, total_cents: total }).select("id").single();
  if (error || !order) return { error: "Could not place the order. Try again." };
  const { error: e2 } = await sb.from("bw_order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));
  if (e2) { await sb.from("bw_orders").delete().eq("id", order.id); return { error: "Could not place the order. Try again." }; }

  redirect(`/order/${order.id}`);
}

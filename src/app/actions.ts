"use server";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { adminEmails, esc, on, sendDiscord, sendEmail } from "@/lib/email";
import { money } from "@/lib/supabase";
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

  // Emails go out after the response so a slow or failing mail service never blocks the order.
  const lines = items.map((i) => `${i.qty} × ${money(i.unit_cents)}`).join(", ");
  const summary = `<p><b>${esc(org)}</b> (${esc(name)}, ${esc(email)})</p><p>Items: ${esc(lines)}<br>Total: <b>${money(total)}</b></p>${notes ? `<p>Notes: ${esc(notes)}</p>` : ""}<p>Order ${order.id}</p>`;
  after(async () => {
    const [to, toAdmin, toCustomer] = [await adminEmails(), await on("notify_admin_email"), await on("notify_customer_email")];
    await Promise.all([
      sendDiscord(`New order from ${org} (${name}): ${money(total)}. ${lines}`),
      to.length && toAdmin ? sendEmail(to, `New order from ${org}`, `<h2>New order</h2>${summary}`, email) : null,
      toCustomer && sendEmail(email, "We received your order", `<h2>Thanks, ${esc(name)}!</h2><p>We received your order and will email a free proof before printing.</p>${summary}`),
    ]);
  });
  redirect(`/order/${order.id}`);
}

// Contact form -> admin inbox. Nothing is stored; honeypot field "website" catches simple bots.
export async function sendContact(_: { msg?: string; error?: string } | undefined, fd: FormData): Promise<{ msg?: string; error?: string }> {
  const str = (k: string) => String(fd.get(k) ?? "").trim();
  const name = str("name").slice(0, 100), email = str("email").slice(0, 200), message = str("message").slice(0, 4000);
  if (str("website")) return { msg: "Thanks, message sent." };
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Please fill in your name, a valid email and a message." };
  const to = (await on("notify_admin_email")) ? await adminEmails() : [];
  const d = await sendDiscord(`Message from ${name} (${email}): ${message}`);
  if (to.length === 0) return d.ok ? { msg: "Thanks, message sent. We reply by email." } : { error: "Messages are not set up yet. Please try again later." };
  const r = await sendEmail(to, `Message from ${name}`, `<p><b>${esc(name)}</b> (${esc(email)})</p><p style="white-space:pre-line">${esc(message)}</p>`, email);
  return r.ok ? { msg: "Thanks, message sent. We reply by email." } : { error: "Could not send your message. Please try again." };
}

import { connection } from "next/server";
import { db } from "./supabase";

// Small editable bits that aren't page blocks. Add a row here and it shows up in /admin.
export type Field = { key: string; label: string; group: string; kind: "text" | "long" | "image" | "toggle"; def: string; secret?: boolean };

export const FIELDS: Field[] = [
  { key: "site_name", label: "Website name", group: "Website name", kind: "text", def: "BadgeWorks" },
  { key: "whatsapp_cc", label: "", group: "WhatsApp", kind: "text", def: "" },
  { key: "whatsapp_number", label: "", group: "WhatsApp", kind: "text", def: "" },
  { key: "wa_float", label: "Show the WhatsApp chat button on every page", group: "WhatsApp", kind: "toggle", def: "1" },
  { key: "wa_checkout", label: "Show Order / Checkout on WhatsApp buttons (category pages and cart)", group: "WhatsApp", kind: "toggle", def: "1" },
  { key: "notify_email", label: "Send order and contact emails to", group: "Email notifications", kind: "text", def: "", secret: true },
  { key: "notify_admin_email", label: "Email me new orders and contact messages", group: "Email notifications", kind: "toggle", def: "1" },
  { key: "notify_customer_email", label: "Email customers an order confirmation", group: "Email notifications", kind: "toggle", def: "1" },
  { key: "notify_status_email", label: "Email customers when I change their order status", group: "Email notifications", kind: "toggle", def: "1" },
  { key: "discord_webhook", label: "Discord webhook URL", group: "Discord notifications", kind: "text", def: "", secret: true },
  { key: "notify_discord", label: "Post new orders and contact messages to Discord", group: "Discord notifications", kind: "toggle", def: "1" },
  { key: "footer_text", label: "Footer text", group: "Footer", kind: "long", def: "We never produce government-issued identity documents." },
];

// Server only. DB values override defaults; any failure falls back to defaults.
export async function getContent(): Promise<Record<string, string>> {
  await connection();
  const out = Object.fromEntries(FIELDS.filter((f) => !f.secret).map((f) => [f.key, f.def]));
  try {
    const { data } = await db().from("bw_content").select("key,value");
    for (const r of data ?? []) if (r.key in out && r.value !== "") out[r.key] = r.value;
  } catch {}
  return out;
}

// Admin only. Private values (admin inbox, Discord webhook) are in bw_secrets, which has no public read policy.
export async function getSecrets(): Promise<Record<string, string>> {
  const { admin } = await import("./supabase");
  const { data } = await admin().from("bw_secrets").select("key,value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

import { admin } from "./supabase";

// Resend over plain fetch (no SDK). Key lives only in the RESEND_API_KEY env var.
// ponytail: without a verified domain Resend only delivers to the account owner. Set EMAIL_FROM once a domain is verified.
const FROM = () => process.env.EMAIL_FROM || "Orders <onboarding@resend.dev>";

export const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const parseEmails = (v: string) => v.split(/[,;\s]+/).filter(Boolean);
export const validEmails = (v: string) => { const l = parseEmails(v); return l.length <= 5 && l.every((e) => /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(e)); };

export async function sendEmail(to: string | string[], subject: string, html: string, replyTo?: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const list = Array.isArray(to) ? to : [to];
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set." };
  if (list.length === 0) return { ok: false, error: "No recipient." };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM(), to: list, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (r.ok) return { ok: true };
    const j = await r.json().catch(() => ({}));
    return { ok: false, error: j.message ?? `Resend error ${r.status}` };
  } catch { return { ok: false, error: "Could not reach Resend." }; }
}

// Admin inbox(es), set on the Settings page. Any address works, Gmail or otherwise.
export async function adminEmails(): Promise<string[]> {
  try {
    const { data } = await admin().from("bw_secrets").select("value").eq("key", "notify_email").maybeSingle();
    return parseEmails(data?.value ?? "");
  } catch { return []; }
}

export const validWebhook = (v: string) => v === "" || /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(v);

// Setting toggles are stored as "1"/"0" in bw_content; anything but "0" means on.
export async function on(key: string): Promise<boolean> {
  try {
    const { data } = await admin().from("bw_content").select("value").eq("key", key).maybeSingle();
    return data?.value !== "0";
  } catch { return true; }
}

// Posts a short message to the admin's Discord channel. Never throws. force = the admin's test button (ignores the toggle).
export async function sendDiscord(text: string, force = false): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!force && !(await on("notify_discord"))) return { ok: false, error: "Discord notifications are switched off." };
    const { data } = await admin().from("bw_secrets").select("value").eq("key", "discord_webhook").maybeSingle();
    if (!data?.value || !validWebhook(data.value)) return { ok: false, error: "Save a Discord webhook URL first." };
    const r = await fetch(data.value, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: text.slice(0, 1900), allowed_mentions: { parse: [] } }) });
    return r.ok ? { ok: true } : { ok: false, error: `Discord answered ${r.status}. Check the webhook URL.` };
  } catch { return { ok: false, error: "Could not reach Discord." }; }
}

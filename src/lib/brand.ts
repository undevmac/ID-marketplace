import { cacheLife, cacheTag } from "next/cache";
import { db } from "./supabase";

export const DEFAULT_SITE_NAME = "BadgeWorks";

// Cached; the Settings save calls updateTag("site") so a rename shows up immediately.
export async function getSiteName(): Promise<string> {
  "use cache";
  cacheTag("site");
  cacheLife("minutes");
  try {
    const { data } = await db().from("bw_content").select("value").eq("key", "site_name").maybeSingle();
    return data?.value?.trim() || DEFAULT_SITE_NAME;
  } catch { return DEFAULT_SITE_NAME; }
}


// Digits only; empty string means that WhatsApp feature is off (no number, or its toggle is off).
export async function getWhatsapp(kind: "float" | "checkout"): Promise<string> {
  "use cache";
  cacheTag("site");
  cacheLife("minutes");
  try {
    const { data } = await db().from("bw_content").select("key,value").in("key", ["whatsapp_number", kind === "float" ? "wa_float" : "wa_checkout"]);
    const v = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    return v[kind === "float" ? "wa_float" : "wa_checkout"] === "0" ? "" : (v.whatsapp_number ?? "").replace(/\D/g, "");
  } catch { return ""; }
}

export { splitBrand } from "./split-brand";

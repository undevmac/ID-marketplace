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

export { splitBrand } from "./split-brand";

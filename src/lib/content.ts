import { connection } from "next/server";
import { db } from "./supabase";

// Small editable bits that aren't page blocks. Add a row here and it shows up in /admin.
export type Field = { key: string; label: string; group: string; kind: "text" | "long" | "image"; def: string };

export const FIELDS: Field[] = [
  { key: "site_name", label: "Website name", group: "Website name", kind: "text", def: "BadgeWorks" },
  { key: "footer_text", label: "Footer text", group: "Footer", kind: "long", def: "We never produce government-issued identity documents." },
];

// Server only. DB values override defaults; any failure falls back to defaults.
export async function getContent(): Promise<Record<string, string>> {
  await connection();
  const out = Object.fromEntries(FIELDS.map((f) => [f.key, f.def]));
  try {
    const { data } = await db().from("bw_content").select("key,value");
    for (const r of data ?? []) if (r.key in out && r.value !== "") out[r.key] = r.value;
  } catch {}
  return out;
}

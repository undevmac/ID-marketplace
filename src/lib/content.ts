import { connection } from "next/server";
import { db } from "./supabase";

// Every editable piece of the site. Add a row here and it appears in /admin automatically.
export type Field = { key: string; label: string; group: string; kind: "text" | "long" | "image"; def: string };

const hero = (n: number, title: string, sub: string, cta: string): Field[] => [
  { key: `hero${n}_title`, label: "Headline", group: `Hero slide ${n}`, kind: "text", def: title },
  { key: `hero${n}_sub`, label: "Sub-text", group: `Hero slide ${n}`, kind: "long", def: sub },
  { key: `hero${n}_cta`, label: "Button text", group: `Hero slide ${n}`, kind: "text", def: cta },
  { key: `hero${n}_image`, label: "Background image (optional)", group: `Hero slide ${n}`, kind: "image", def: "" },
];

export const FIELDS: Field[] = [
  ...hero(1, "Badges your team will actually wear", "Staff ID cards printed on durable PVC, from 1 card.", "Shop badges"),
  ...hero(2, "Student IDs, ready for the term", "Photo cards with student numbers, barcodes or QR.", "Student IDs"),
  ...hero(3, "Props for film, games & cosplay", "Fictional issuers. Always marked PROP – NOT A GOVERNMENT ID.", "See props"),
  { key: "ticker", label: "Scrolling banner (one message per line)", group: "Banner & sections", kind: "long",
    def: "Free proofs before print\nBulk discounts from 50 cards\nShips in 3–5 working days\nStaff badges\nStudent IDs\nVisitor passes\nProp cards (clearly marked)" },
  { key: "badges_title", label: "Badges section title", group: "Banner & sections", kind: "text", def: "Organization badges & IDs" },
  { key: "props_title", label: "Prop cards section title", group: "Banner & sections", kind: "text", def: "Prop cards (fictional, clearly marked)" },
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

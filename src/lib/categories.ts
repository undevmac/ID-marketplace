import { connection } from "next/server";
import { db } from "./supabase";

export type Category = { slug: string; label: string; description: string; image: string; is_prop: boolean; sort: number };

// Public read (RLS allows it). Empty list if the database is unreachable.
export async function listCategories(): Promise<Category[]> {
  await connection();
  try {
    const { data } = await db().from("bw_categories").select("*").order("sort").order("label");
    return (data as Category[]) ?? [];
  } catch { return []; }
}

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Read-only public client (RLS: products only).
export const db = () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
// Server-only: orders are written here. Never import from a client component.
export const admin = () => createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export type Product = {
  id: string; slug: string; name: string; kind: "badge" | "prop";
  category: string; description: string; price_cents: number; image: string; badge: string | null;
};
export const money = (c: number) => `$${(c / 100).toFixed(2)}`;

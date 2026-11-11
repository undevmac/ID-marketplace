import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "./supabase";

export const COOKIE = "bw_at";

// ponytail: any authenticated user is an admin. Safe only because public sign-ups are
// disabled in Supabase (users are created manually in Auth → Users). Add an allowlist if that changes.
// Session = Supabase access token in an httpOnly cookie (1h); re-login after expiry.
// cache(): several calls in one request cost a single Supabase round trip.
export const getAdmin = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user ?? null;
});

// Every admin PAGE calls this itself: layouts don't re-run on client-side navigation, so a layout check alone isn't enough.
export async function requireAdmin() {
  const u = await getAdmin();
  if (!u) redirect("/admin/login");
  return u;
}

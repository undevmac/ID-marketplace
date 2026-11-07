import { cookies } from "next/headers";
import { admin } from "./supabase";

export const COOKIE = "bw_at";

// ponytail: any authenticated user is an admin. Safe only because public sign-ups are
// disabled in Supabase (users are created manually in Auth → Users). Add an allowlist if that changes.
// Session = Supabase access token in an httpOnly cookie (1h); re-login after expiry.
export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user ?? null;
}

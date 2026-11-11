import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return { title: { absolute: `${await getSiteName()} admin` }, robots: { index: false, follow: false } };
}

// Admin never uses the storefront layout: no customer header, footer or ambient animation.
export default function AdminRoot({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-paper text-ink">{children}</div>;
}

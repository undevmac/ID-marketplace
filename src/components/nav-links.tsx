import Link from "next/link";
import { getNav } from "@/lib/pages";

// Server component: page links come from the page builder (pages with "show in menu" on).
export default async function NavLinks({ className = "" }: { className?: string }) {
  const nav = await getNav();
  return <>{nav.map((p) => <Link key={p.slug} href={`/${p.slug}`} className={className}>{p.title}</Link>)}</>;
}

import Link from "next/link";
import { getNav } from "@/lib/pages";
import NavDropdown from "./nav-dropdown";

const item = "min-h-11 px-3 flex items-center rounded-lg hover:bg-white/10 text-sm whitespace-nowrap";

// Server component: links come from the page builder (pages with "show in menu" on).
// desktop: category pages live under one "Categories" dropdown, other pages sit inline.
// mobile: one flat list with small headings (it already sits inside the ☰ dropdown).
export default async function NavLinks({ variant }: { variant: "desktop" | "mobile" }) {
  const nav = await getNav();
  const cats = nav.filter((p) => p.origin === "category");
  const rest = nav.filter((p) => p.origin !== "category");
  const link = (p: { slug: string; title: string }) => <Link key={p.slug} href={`/${p.slug}`} className={item}>{p.title}</Link>;

  if (variant === "mobile") {
    const head = (t: string) => <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-white/50">{t}</p>;
    return <>{cats.length > 0 && head("Categories")}{cats.map(link)}{cats.length > 0 && rest.length > 0 && head("Pages")}{rest.map(link)}</>;
  }
  return <>{cats.length > 0 && <NavDropdown label="Categories">{cats.map(link)}</NavDropdown>}{rest.map(link)}</>;
}

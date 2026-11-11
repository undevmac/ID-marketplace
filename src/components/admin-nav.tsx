"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const LINKS = [
  ["/admin", "Overview", "▦"], ["/admin/pages", "Pages", "▤"], ["/admin/products", "Products", "▣"],
  ["/admin/categories", "Categories", "◧"], ["/admin/orders", "Orders", "✉"], ["/admin/settings", "Settings", "⚙"],
] as const;

// Sidebar on desktop, scrollable top bar on phones.
export default function AdminNav() {
  const path = usePathname();
  const on = (h: string) => (h === "/admin" ? path === h : path === h || path.startsWith(h + "/"));
  return (
    <aside className="bg-navy text-white md:w-60 md:shrink-0 md:min-h-screen md:sticky md:top-0 md:h-screen md:flex md:flex-col">
      <div className="px-4 h-14 flex items-center justify-between md:block md:h-auto md:py-5">
        <p className="font-display text-xl font-bold">Badge<span className="text-amber">Works</span> <span className="text-xs font-sans font-normal text-white/60 ml-1">admin</span></p>
        <form action={logout} className="md:hidden"><button className="min-h-11 px-3 text-sm underline">Log out</button></form>
      </div>
      <nav aria-label="Admin" className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar px-2 pb-2 md:pb-0 md:flex-1">
        {LINKS.map(([h, label, icon]) => (
          <Link key={h} href={h} aria-current={on(h) ? "page" : undefined}
            className={`min-h-11 px-3 flex items-center gap-2 rounded-lg whitespace-nowrap text-sm font-medium ${on(h) ? "bg-white/15 text-amber" : "hover:bg-white/10"}`}>
            <span aria-hidden className="w-5 text-center">{icon}</span>{label}
          </Link>
        ))}
      </nav>
      <div className="hidden md:block p-3 space-y-1 border-t border-white/10">
        <a href="/" target="_blank" className="min-h-11 px-3 flex items-center rounded-lg text-sm hover:bg-white/10">View site ↗</a>
        <form action={logout}><button className="w-full min-h-11 px-3 flex items-center rounded-lg text-sm hover:bg-white/10 text-left">Log out</button></form>
      </div>
    </aside>
  );
}

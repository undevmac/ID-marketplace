"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const LINKS = [
  ["/admin", "Overview", "▦"], ["/admin/pages", "Pages", "▤"], ["/admin/products", "Products", "▣"],
  ["/admin/categories", "Categories", "◧"], ["/admin/orders", "Orders", "✉"], ["/admin/settings", "Settings", "⚙"],
] as const;

// Desktop: sidebar. Phone: slim top bar + fixed bottom tab bar (thumb-reachable, nothing cut off).
export default function AdminNav() {
  const path = usePathname();
  const on = (h: string) => (h === "/admin" ? path === h : path === h || path.startsWith(h + "/"));
  return (
    <>
      <aside className="bg-navy text-white md:w-60 md:shrink-0 md:min-h-screen md:sticky md:top-0 md:h-screen md:flex md:flex-col">
        <div className="px-4 h-14 flex items-center justify-between md:block md:h-auto md:py-5">
          <p className="font-display text-xl font-bold">Badge<span className="text-amber">Works</span> <span className="text-xs font-sans font-normal text-white/60 ml-1">admin</span></p>
          <div className="flex items-center md:hidden">
            <a href="/" target="_blank" className="min-h-11 px-3 grid place-items-center text-sm">View site ↗</a>
            <form action={logout}><button className="min-h-11 px-3 text-sm underline">Log out</button></form>
          </div>
        </div>
        <nav aria-label="Admin" className="hidden md:flex md:flex-col gap-1 px-2 flex-1">
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

      <nav aria-label="Admin tabs" className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-navy text-white border-t border-white/10 grid grid-cols-6">
        {LINKS.map(([h, label, icon]) => (
          <Link key={h} href={h} aria-current={on(h) ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${on(h) ? "text-amber" : "text-white/80"}`}>
            <span aria-hidden className={`text-lg leading-none px-3 py-1 rounded-full ${on(h) ? "bg-white/15" : ""}`}>{icon}</span>{label}
          </Link>
        ))}
      </nav>
    </>
  );
}

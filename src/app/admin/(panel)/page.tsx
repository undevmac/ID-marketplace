import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { admin, money } from "@/lib/supabase";
import { listPages } from "@/lib/pages";
import { listCategories } from "@/lib/categories";
import { statusLabel } from "@/lib/orders";
import { Head, btnGhost, card } from "@/components/admin-ui";

export default async function Overview() {
  await requireAdmin();
  const sb = admin();
  const [pages, cats, prods, newOrders, recent] = await Promise.all([
    listPages(),
    listCategories(),
    sb.from("bw_products").select("active"),
    sb.from("bw_orders").select("id", { count: "exact", head: true }).eq("status", "received"),
    sb.from("bw_orders").select("id,org_name,total_cents,status,created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  const products = prods.data ?? [];
  const hidden = products.filter((p) => !p.active).length;
  const drafts = pages.filter((p) => !p.published).length;

  const stats = [
    { href: "/admin/orders", label: "New orders", value: newOrders.count ?? 0, note: "waiting to be handled" },
    { href: "/admin/products", label: "Products", value: products.length, note: hidden ? `${hidden} hidden` : "all visible" },
    { href: "/admin/categories", label: "Categories", value: cats.length, note: "each has its own page" },
    { href: "/admin/pages", label: "Pages", value: pages.length, note: drafts ? `${drafts} draft` : "all live" },
  ];

  return (
    <>
      <Head title="Overview" sub="Everything about your store in one place." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className={`${card} hover:shadow-md transition-shadow`}>
            <p className="text-sm text-black/60">{s.label}</p>
            <p className="font-display text-4xl font-bold">{s.value}</p>
            <p className="text-xs text-black/60">{s.note}</p>
          </Link>
        ))}
      </div>

      <section className={card}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold">Latest orders</h2>
          <Link href="/admin/orders" className={btnGhost}>All orders</Link>
        </div>
        {(recent.data ?? []).length === 0 && <p className="text-black/60">No orders yet.</p>}
        <ul className="divide-y">
          {(recent.data ?? []).map((o) => (
            <li key={o.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
              <div><p className="font-bold">{o.org_name}</p><p className="text-xs text-black/60">{new Date(o.created_at).toLocaleString()}</p></div>
              <div className="flex items-center gap-3"><span className="text-xs font-bold bg-amber/30 rounded-full px-2 py-1">{statusLabel(o.status)}</span><span className="font-bold tabular-nums">{money(o.total_cents)}</span></div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

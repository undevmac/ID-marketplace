import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { admin, money } from "@/lib/supabase";
import { listCategories } from "@/lib/categories";
import CardArt from "@/components/card-art";
import { Head, btnPrimary, card } from "@/components/admin-ui";
import type { AdminProduct } from "@/components/product-form";
import { DeleteForm } from "@/components/admin-forms";
import { deleteProduct } from "../../actions";

export default async function Products({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = typeof sp.category === "string" ? sp.category : "";
  const [cats, { data }] = await Promise.all([listCategories(), admin().from("bw_products").select("*").order("created_at", { ascending: false })]);
  const all = (data as AdminProduct[]) ?? [];
  const items = filter ? all.filter((p) => p.category === filter) : all;
  const label = (slug: string) => cats.find((c) => c.slug === slug)?.label ?? slug;
  const chip = (on: boolean) => `shrink-0 whitespace-nowrap min-h-11 px-4 inline-grid place-items-center rounded-full text-sm font-bold border ${on ? "bg-navy text-white border-navy" : "border-black/20 hover:bg-black/5"}`;

  return (
    <>
      <Head title="Products" sub={`${all.length} product${all.length === 1 ? "" : "s"}. Everything you add or edit here shows on the website straight away.`}>
        <Link href={`/admin/products/new${filter ? `?category=${filter}` : ""}`} className={btnPrimary}>+ Add product</Link>
      </Head>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap mb-5">
        <Link href="/admin/products" className={chip(!filter)}>All ({all.length})</Link>
        {cats.map((c) => <Link key={c.slug} href={`/admin/products?category=${c.slug}`} className={chip(filter === c.slug)}>{c.label} ({all.filter((p) => p.category === c.slug).length})</Link>)}
      </div>

      {items.length === 0 && <p className={card}>No products here yet.</p>}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className={`${card} !p-3 flex flex-wrap sm:flex-nowrap items-center gap-3`}>
            <div className="flex gap-3 min-w-0 flex-1 basis-full sm:basis-0">
            <div className="w-24 sm:w-28 shrink-0"><CardArt p={p} /></div>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-snug">{p.name}</p>
              <p className="text-sm text-black/60">{label(p.category)} · <span className="tabular-nums">{money(p.price_cents)}</span></p>
              <p className="mt-1"><span className={`text-xs font-bold rounded-full px-2 py-1 ${p.active ? "bg-green-100 text-green-800" : "bg-black/10 text-black/70"}`}>{p.active ? "Visible" : "Hidden"}</span>{p.badge && <span className="ml-2 text-xs font-bold bg-amber/40 rounded-full px-2 py-1">{p.badge}</span>}</p>
            </div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
              <Link href={`/admin/products/${p.id}`} className={btnPrimary}>Edit</Link>
              <DeleteForm action={deleteProduct} name="id" value={p.id} message={`Delete “${p.name}” permanently?`} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { admin, money } from "@/lib/supabase";
import { ORDER_STATUSES, statusLabel } from "@/lib/orders";
import { SaveForm } from "@/components/admin-forms";
import { Head, card, input } from "@/components/admin-ui";
import { setOrderStatus } from "../../actions";

type Order = {
  id: string; org_name: string; contact_name: string; email: string; notes: string; total_cents: number; status: string; created_at: string;
  bw_order_items: { qty: number; unit_cents: number; bw_products: { name: string } | null }[];
};

export default async function Orders({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && ORDER_STATUSES.some((o) => o[0] === sp.status) ? sp.status : "";
  let q = admin().from("bw_orders").select("id,org_name,contact_name,email,notes,total_cents,status,created_at,bw_order_items(qty,unit_cents,bw_products(name))").order("created_at", { ascending: false }).limit(100);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const orders = (data as unknown as Order[]) ?? [];
  const chip = (on: boolean) => `min-h-11 px-4 inline-grid place-items-center rounded-full text-sm font-bold border ${on ? "bg-navy text-white border-navy" : "border-black/20 hover:bg-black/5"}`;

  return (
    <>
      <Head title="Orders" sub="Order requests from customers, newest first. Final prices come from the catalogue at the time of the order." />
      <div className="flex gap-2 flex-wrap mb-5">
        <Link href="/admin/orders" className={chip(!status)}>All</Link>
        {ORDER_STATUSES.map(([v, l]) => <Link key={v} href={`/admin/orders?status=${v}`} className={chip(status === v)}>{l}</Link>)}
      </div>

      {orders.length === 0 && <p className={card}>No orders {status ? `with status “${statusLabel(status)}”` : "yet"}.</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <details className={`${card} !p-0 group`}>
              <summary className="p-4 cursor-pointer list-none flex items-center justify-between gap-3 flex-wrap min-h-14">
                <div className="min-w-0">
                  <p className="font-bold truncate">{o.org_name}</p>
                  <p className="text-xs text-black/60">{o.contact_name} · {new Date(o.created_at).toLocaleString()} · #{o.id.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-amber/30 rounded-full px-2 py-1">{statusLabel(o.status)}</span>
                  <span className="font-bold tabular-nums">{money(o.total_cents)}</span>
                  <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
                </div>
              </summary>
              <div className="px-4 pb-4 space-y-4 border-t pt-4">
                <p className="text-sm">Contact: <a className="underline" href={`mailto:${o.email}`}>{o.email}</a></p>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-black/60"><th className="py-1 font-medium">Item</th><th className="font-medium text-right">Qty</th><th className="font-medium text-right">Each</th><th className="font-medium text-right">Total</th></tr></thead>
                  <tbody>
                    {o.bw_order_items.map((i, k) => (
                      <tr key={k} className="border-t"><td className="py-2">{i.bw_products?.name ?? "Deleted product"}</td><td className="text-right tabular-nums">{i.qty}</td><td className="text-right tabular-nums">{money(i.unit_cents)}</td><td className="text-right tabular-nums">{money(i.qty * i.unit_cents)}</td></tr>
                    ))}
                  </tbody>
                </table>
                {o.notes && <div><p className="text-sm font-medium">Customer notes</p><p className="whitespace-pre-line bg-black/5 rounded-lg p-3 text-sm">{o.notes}</p></div>}
                <SaveForm action={setOrderStatus} label="Update status" className="flex items-end gap-3 flex-wrap">
                  <input type="hidden" name="id" value={o.id} />
                  <label className="block font-medium">Status
                    <select name="status" defaultValue={o.status} className={`${input} w-auto`}>{ORDER_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  </label>
                </SaveForm>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import ConfettiClear from "@/components/confetti-clear";
import { admin, money } from "@/lib/supabase";

export default function OrderPage({ params }: PageProps<"/order/[id]">) {
  return <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-16"><div className="skeleton rounded-2xl h-40" /></div>}><Order params={params} /></Suspense>;
}

async function Order({ params }: Pick<PageProps<"/order/[id]">, "params">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  // ponytail: unguessable UUID is the access key; add email-verified lookup if orders get sensitive
  const { data: o } = await admin().from("bw_orders").select("id,org_name,total_cents,status").eq("id", id).maybeSingle();
  if (!o) notFound();
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-3">
      <ConfettiClear />
      <h1 className="font-display text-4xl font-bold">Order received 🎉</h1>
      <p>Thanks, {o.org_name}. We&rsquo;ll email you a proof before printing.</p>
      <p className="font-display text-2xl font-bold">{money(o.total_cents)}</p>
      <p className="text-sm text-black/60">Reference {o.id.slice(0, 8)}</p>
    </div>
  );
}

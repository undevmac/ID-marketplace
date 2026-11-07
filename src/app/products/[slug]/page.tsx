import { Suspense } from "react";
import { notFound } from "next/navigation";
import CardArt from "@/components/card-art";
import AddButton from "@/components/add-button";
import { db, money, type Product } from "@/lib/supabase";

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8"><div className="skeleton rounded-2xl aspect-[1.586]" /><div className="skeleton rounded-2xl h-48" /></div>}><ProductBody params={params} /></Suspense>;
}

async function ProductBody({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const { slug } = await params;
  const { data } = await db().from("bw_products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  const p = data as Product | null;
  if (!p) notFound();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div id="art-main" className="reveal"><CardArt p={p} big /></div>
      <div className="reveal space-y-4" style={{ "--i": 1 } as React.CSSProperties}>
        <h1 className="font-display text-3xl font-bold">{p.name}</h1>
        <p className="text-lg">{p.description}</p>
        {p.kind === "prop" && <p className="text-sm bg-amber/30 rounded p-3">Novelty prop. Fictional issuer. Carries a permanent &ldquo;PROP – NOT A GOVERNMENT ID&rdquo; mark.</p>}
        <p className="font-display text-3xl font-bold">{money(p.price_cents)}</p>
        {/* sticky on mobile so the primary action stays thumb-reachable */}
        <div className="fixed bottom-0 inset-x-0 p-3 bg-white/95 shadow-[0_-4px_12px_#0001] md:static md:p-0 md:shadow-none md:bg-transparent z-40">
          <AddButton p={p} sourceId="art-main" className="w-full md:w-auto" />
        </div>
      </div>
    </div>
  );
}

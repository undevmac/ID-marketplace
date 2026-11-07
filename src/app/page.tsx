import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import Hero from "@/components/hero";
import CardArt from "@/components/card-art";
import AddButton from "@/components/add-button";
import { db, money, type Product } from "@/lib/supabase";

async function products(): Promise<Product[]> {
  try {
    const { data } = await db().from("bw_products").select("*").eq("active", true).order("created_at");
    return (data as Product[]) ?? [];
  } catch { return []; } // env not configured yet
}

function Grid({ id, title, items }: { id: string; title: string; items: Product[] }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4 pt-12 scroll-mt-20">
      <h2 className="reveal font-display text-3xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p, i) => (
          <article key={p.id} style={{ "--i": i } as React.CSSProperties} className="reveal group bg-white rounded-2xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-[transform,box-shadow]">
            <Link href={`/products/${p.slug}`} className="block relative">
              <div id={`art-${p.slug}`}><CardArt p={p} /></div>
              {p.badge && <span className="shine overflow-hidden absolute top-2 right-2 bg-amber text-ink text-xs font-black px-2 py-1 rounded-full">{p.badge}</span>}
            </Link>
            <h3 className="font-bold mt-3">{p.name}</h3>
            <p className="text-sm text-black/60 line-clamp-2 min-h-10">{p.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-display text-xl font-bold">{money(p.price_cents)}</span>
              <AddButton p={p} sourceId={`art-${p.slug}`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const TICKER = ["Free proofs before print", "Bulk discounts from 50 cards", "Ships in 3–5 working days", "Staff badges", "Student IDs", "Visitor passes", "Prop cards (clearly marked)"];

async function Catalog() {
  await connection(); // render per request so catalogue edits show up immediately
  const all = await products();
  return (
    <>
      {all.length === 0 && <p className="max-w-6xl mx-auto px-4 pt-12">Products are loading soon. (Connect Supabase and run the migration.)</p>}
      <Grid id="badges" title="Organization badges & IDs" items={all.filter((p) => p.kind === "badge")} />
      <Grid id="props" title="Prop cards (fictional, clearly marked)" items={all.filter((p) => p.kind === "prop")} />
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy>
      {[0, 1, 2].map((i) => <div key={i} className="skeleton rounded-2xl h-64" />)}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <div className="marquee overflow-hidden bg-amber text-ink font-bold py-3" aria-hidden>
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => <span key={i}>✦ {t}</span>)}
        </div>
      </div>
      <Suspense fallback={<CatalogSkeleton />}><Catalog /></Suspense>
    </>
  );
}

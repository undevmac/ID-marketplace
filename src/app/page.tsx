import Link from "next/link";
import { Suspense } from "react";
import { getContent } from "@/lib/content";
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

async function Catalog({ c }: { c: Record<string, string> }) {
  const all = await products();
  return (
    <>
      {all.length === 0 && <p className="max-w-6xl mx-auto px-4 pt-12">Products are loading soon. (Connect Supabase and run the migration.)</p>}
      <Grid id="badges" title={c.badges_title} items={all.filter((p) => p.kind === "badge")} />
      <Grid id="props" title={c.props_title} items={all.filter((p) => p.kind === "prop")} />
    </>
  );
}

// Request-time render so admin edits show immediately.
async function Page() {
  const c = await getContent();
  const ticker = c.ticker.split(/\r?\n/).map((t) => t.trim()).filter(Boolean);
  const copy = [1, 2, 3].map((n) => ({ h: c[`hero${n}_title`], s: c[`hero${n}_sub`], cta: c[`hero${n}_cta`], image: c[`hero${n}_image`] }));
  return (
    <>
      <Hero copy={copy} />
      <div className="marquee overflow-hidden bg-amber text-ink font-bold py-3" aria-hidden>
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...ticker, ...ticker].map((t, i) => <span key={i}>✦ {t}</span>)}
        </div>
      </div>
      <Catalog c={c} />
    </>
  );
}

export default function Home() {
  return <Suspense fallback={<div className="skeleton h-[60vh]" />}><Page /></Suspense>;
}

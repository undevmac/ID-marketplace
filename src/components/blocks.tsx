import type { ReactNode } from "react";
import { db, money, type Product } from "@/lib/supabase";
import { listCategories } from "@/lib/categories";
import type { Block, Item } from "@/lib/blocks";
import A from "./a";
import Hero from "./hero";
import CardArt from "./card-art";
import AddButton from "./add-button";
import CategoryTiles from "./category-tiles";
import Parallax from "./parallax";
import Link from "next/link";
import ContactForm from "./contact-form";
import Script from "next/script";
import { getWhatsapp } from "@/lib/brand";
import { waLink } from "@/lib/wa";

const W = "max-w-6xl mx-auto px-4";
const s = (v: unknown) => (typeof v === "string" ? v : "");
const list = (v: unknown) => (Array.isArray(v) ? (v as Item[]) : []);
const idx = (i: number) => ({ "--i": i }) as React.CSSProperties;

function Btn({ href, children }: { href: string; children: ReactNode }) {
  return <A href={href} className="inline-grid place-items-center min-h-11 px-6 rounded-full bg-amber text-ink font-bold hover:brightness-95 active:scale-95 transition">{children}</A>;
}

// Wavy bottom edge, filled with the page background so the next section "tears" in.
function Wave() {
  return (
    <svg aria-hidden viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute -bottom-px left-0 w-full h-8 md:h-12 text-paper fill-current">
      <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" />
    </svg>
  );
}

async function ProductGrid({ title, category }: { title: string; category: string }) {
  let q = db().from("bw_products").select("*").eq("active", true).order("created_at");
  if (category !== "all") q = q.eq("category", category);
  const { data } = await q;
  const items = (data as Product[]) ?? [];
  // A category is one product in several looks: show the looks as samples and one Order button at the lowest price.
  if (category !== "all" && items.length > 0) {
    const cheapest = items.reduce((a, p) => (p.price_cents < a.price_cents ? p : a));
    const wa = await getWhatsapp();
    return (
      <section className={`${W} pt-12`}>
        {title && <h2 className="reveal font-display text-3xl font-bold mb-6">{title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p, i) => (
            <article key={p.id} style={idx(i)} className="reveal bg-white rounded-2xl p-4 shadow-sm">
              <div id={`art-${p.slug}-${title.length}`}><CardArt p={p} /></div>
              <h3 className="font-bold mt-3">{p.name}</h3>
              <p className="text-sm text-black/60 line-clamp-2">{p.description}</p>
            </article>
          ))}
        </div>
        <div className="reveal mt-6 flex flex-wrap items-center gap-4">
          <span className="font-display text-2xl font-bold">{money(cheapest.price_cents)} <span className="text-base font-normal text-black/60">per card</span></span>
          <AddButton p={cheapest} sourceId={`art-${cheapest.slug}-${title.length}`} label="Order this category" />
          {wa && <a href={waLink(wa, `Hi, I'd like to order the ${items[0].category} cards (${money(cheapest.price_cents)} per card).`)} target="_blank" rel="noopener noreferrer" className="min-h-11 px-5 rounded-full bg-[#25D366] text-white font-bold grid place-items-center">Order on WhatsApp</a>}
        </div>
        <p className="mt-2 text-sm text-black/60">Samples show the styles available. Tell us which one you want in your order notes.</p>
      </section>
    );
  }
  return (
    <section className={`${W} pt-12`}>
      {title && <h2 className="reveal font-display text-3xl font-bold mb-6">{title}</h2>}
      {items.length === 0 && <p className="text-black/60">No products here yet.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p, i) => (
          <article key={p.id} style={idx(i)} className="reveal group bg-white rounded-2xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-[transform,box-shadow]">
            <Link href={`/products/${p.slug}`} className="block relative">
              <div id={`art-${p.slug}-${title.length}`}><CardArt p={p} /></div>
              {p.badge && <span className="shine overflow-hidden absolute top-2 right-2 bg-amber text-ink text-xs font-black px-2 py-1 rounded-full">{p.badge}</span>}
            </Link>
            <h3 className="font-bold mt-3">{p.name}</h3>
            <p className="text-sm text-black/60 line-clamp-2 min-h-10">{p.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-display text-xl font-bold">{money(p.price_cents)}</span>
              <AddButton p={p} sourceId={`art-${p.slug}-${title.length}`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// Automatic mode lists every category from the database, so adding a category in the admin adds a tile.
async function Tiles({ title, auto, tiles }: { title: string; auto: boolean; tiles: Item[] }) {
  const items = auto ? (await listCategories()).map((c) => ({ title: c.label, blurb: c.description, href: `/${c.slug}`, image: c.image, prop: c.is_prop ? "1" : "" })) : tiles;
  if (items.length === 0) return null;
  return (
    <section id="categories" className={`${W} pt-12 scroll-mt-16`}>
      {title && <h2 className="reveal font-display text-3xl font-bold mb-6">{title}</h2>}
      <CategoryTiles tiles={items} />
    </section>
  );
}

function One({ b }: { b: Block }) {
  const d = b.data;
  switch (b.type) {
    case "hero":
      return !list(d.slides).length ? null : <Hero slides={list(d.slides).map((x) => ({ title: s(x.title), sub: s(x.sub), cta: s(x.cta), href: s(x.href), image: s(x.image) }))} />;
    case "ticker": {
      const items = s(d.items).split(/\r?\n/).map((t) => t.trim()).filter(Boolean);
      return (
        <div className="marquee overflow-hidden bg-amber text-ink font-bold py-3" aria-hidden>
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap">{[...items, ...items].map((t, i) => <span key={i}>✦ {t}</span>)}</div>
        </div>
      );
    }
    case "categories":
      return <Tiles title={s(d.title)} auto={!!s(d.auto)} tiles={list(d.tiles)} />;
    case "products":
      return <ProductGrid title={s(d.title)} category={s(d.category) || "all"} />;
    case "livechat": {
      // Only Tawk.to links are accepted, so a typo or paste can't load some other site's script.
      const m = s(d.src).match(/https:\/\/embed\.tawk\.to\/[\w-]+\/[\w-]+/);
      return m ? <Script src={m[0]} strategy="lazyOnload" crossOrigin="anonymous" /> : null;
    }
    case "contact":
      return <ContactForm heading={s(d.heading)} body={s(d.body)} />;
    case "text":
      return (
        <section className={`${W} pt-12 reveal ${s(d.align) === "center" ? "text-center" : ""}`}>
          <div className="max-w-3xl mx-auto">
            {s(d.heading) && <h2 className="font-display text-3xl font-bold mb-3">{s(d.heading)}</h2>}
            <p className="text-lg whitespace-pre-line">{s(d.body)}</p>
          </div>
        </section>
      );
    case "image_text":
      return (
        <section className={`${W} pt-12 grid md:grid-cols-2 gap-8 items-center`}>
          {s(d.image) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s(d.image)} alt="" loading="lazy" className={`reveal w-full rounded-2xl object-cover aspect-[4/3] ${s(d.side) === "right" ? "md:order-2" : ""}`} />
          )}
          <div className={`reveal space-y-3 ${s(d.image) ? "" : "md:col-span-2 max-w-3xl mx-auto"}`} style={idx(1)}>
            <h2 className="font-display text-3xl font-bold">{s(d.heading)}</h2>
            <p className="text-lg whitespace-pre-line">{s(d.body)}</p>
            {s(d.cta) && <Btn href={s(d.href)}>{s(d.cta)}</Btn>}
          </div>
        </section>
      );
    case "banner":
      return (
        <section className={`relative overflow-hidden text-white ${s(d.size) === "tall" ? "min-h-[460px]" : "min-h-[280px]"} mt-12 first:mt-0 grid items-center`}>
          <Parallax src={s(d.image)} />
          <div className={`${W} relative py-16 space-y-3 reveal`}>
            <h2 className="font-display font-extrabold text-[clamp(1.875rem,8vw,3rem)] max-w-2xl break-words">{s(d.heading)}</h2>
            {s(d.sub) && <p className="text-lg max-w-xl text-white/90">{s(d.sub)}</p>}
            {s(d.cta) && <Btn href={s(d.href)}>{s(d.cta)}</Btn>}
          </div>
          {s(d.wave) && <Wave />}
        </section>
      );
    case "faq":
      return (
        <section className={`${W} pt-12`}>
          <div className="max-w-3xl mx-auto">
            {s(d.title) && <h2 className="reveal font-display text-3xl font-bold mb-4">{s(d.title)}</h2>}
            {list(d.items).map((q, i) => (
              <details key={i} className="reveal group bg-white rounded-xl mb-2 px-4" style={idx(i)}>
                <summary className="min-h-12 flex items-center justify-between cursor-pointer font-bold list-none">
                  {s(q.q)}<span className="transition-transform group-open:rotate-45 text-2xl">+</span>
                </summary>
                <p className="pb-4 whitespace-pre-line">{s(q.a)}</p>
              </details>
            ))}
          </div>
        </section>
      );
    case "cta":
      return (
        <section className={`${W} pt-12`}>
          <div className="reveal relative overflow-hidden rounded-3xl bg-navy text-white text-center px-6 py-14 space-y-3">
            <h2 className="font-display text-3xl md:text-4xl font-bold">{s(d.heading)}</h2>
            {s(d.body) && <p className="text-white/85 max-w-xl mx-auto">{s(d.body)}</p>}
            {s(d.cta) && <Btn href={s(d.href)}>{s(d.cta)}</Btn>}
          </div>
        </section>
      );
    default:
      return null;
  }
}

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((b) => <One key={b.id} b={b} />)}</>;
}

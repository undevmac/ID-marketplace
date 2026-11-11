"use client";
import CardArt from "./card-art";
import A from "./a";
import type { Item } from "@/lib/blocks";

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";

// Swipeable scroll-snap row on phones, grid on desktop. Tilt + glare use transform/opacity only.
export default function CategoryTiles({ tiles }: { tiles: Item[] }) {
  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (still()) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(700px) rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg)`;
    const g = el.querySelector<HTMLElement>("[data-glare]");
    if (g) { g.style.transform = `translate(${(x - 0.5) * 100}%,${(y - 0.5) * 100}%)`; g.style.opacity = "1"; }
  };
  const leave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "";
    const g = e.currentTarget.querySelector<HTMLElement>("[data-glare]");
    if (g) g.style.opacity = "0";
  };

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible">
      {tiles.map((t, i) => (
        <A key={i} href={t.href} style={{ "--i": i } as React.CSSProperties}
          onPointerMove={move} onPointerLeave={leave} onPointerCancel={leave}
          className="reveal relative block shrink-0 w-[68%] sm:w-[42%] md:w-auto snap-start rounded-2xl bg-white p-3 shadow-sm overflow-hidden transition-transform duration-200 will-change-transform min-h-11">
          {t.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={t.image} alt="" loading="lazy" className="w-full aspect-[1.586] object-cover rounded-xl" />
            : <CardArt p={{ name: t.title, kind: t.prop ? "prop" : "badge" }} />}
          <h3 className="font-display font-bold mt-3">{t.title}</h3>
          <p className="text-sm text-black/60">{t.blurb}</p>
          <span data-glare aria-hidden className="pointer-events-none absolute -inset-1/2 opacity-0 transition-opacity duration-200"
            style={{ background: "radial-gradient(circle at center, rgba(255,255,255,.55), transparent 45%)" }} />
        </A>
      ))}
    </div>
  );
}

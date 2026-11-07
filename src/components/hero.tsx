"use client";
import A from "./a";
import { useEffect, useRef, useState } from "react";

// Look is fixed here; words, links and images come from the page builder.
const BG = ["from-navy to-navy2", "from-navy2 to-indigo-700", "from-purple-800 to-fuchsia-600"];
export type Slide = { title: string; sub: string; cta: string; href: string; image: string };
const MS = 6000;

export default function Hero({ slides }: { slides: Slide[] }) {
  const SLIDES = slides;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  const go = (n: number) => { setI(n); track.current?.scrollTo({ left: n * track.current.clientWidth, behavior: "smooth" }); };

  // Auto-advance; progress bar is a CSS animation re-keyed per slide.
  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off") return;
    const t = setTimeout(() => go((i + 1) % SLIDES.length), MS);
    return () => clearTimeout(t);
  });

  // Swipe (native scroll-snap) -> sync active slide.
  const onScroll = () => { const t = track.current!; const n = Math.round(t.scrollLeft / t.clientWidth); if (n !== i) setI(n); };

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="relative"
      onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
      <div ref={track} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {SLIDES.map((s, n) => (
          <div key={n} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${SLIDES.length}`} id={`slide-${n}`}
            className={`snap-center shrink-0 w-full h-[70vh] min-h-[420px] max-h-[620px] relative overflow-hidden text-white ${n === i ? "slide-active" : ""}`}>
            <div className={`kb absolute inset-0 bg-gradient-to-br ${BG[n % BG.length]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {s.image && <img src={s.image} alt="" className="w-full h-full object-cover" loading={n ? "lazy" : "eager"} />}
              {s.image && <div className="absolute inset-0 bg-navy/55" />}
            </div>
            <div className="relative max-w-6xl mx-auto h-full px-4 flex flex-col justify-center gap-4 stagger">
              <h1 style={{ "--i": 0 } as React.CSSProperties} className="font-display font-extrabold text-4xl sm:text-6xl max-w-2xl leading-tight">{s.title}</h1>
              <p style={{ "--i": 1 } as React.CSSProperties} className="text-lg max-w-xl text-white/85">{s.sub}</p>
              {s.cta && <A style={{ "--i": 2 } as React.CSSProperties} href={s.href} className="self-start min-h-11 px-6 grid place-items-center rounded-full bg-amber text-ink font-bold">{s.cta}</A>}
            </div>
          </div>
        ))}
      </div>
      <div role="tablist" aria-label="Choose slide" className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
        {SLIDES.map((_, n) => (
          <button key={n} role="tab" aria-selected={n === i} aria-controls={`slide-${n}`} aria-label={`Slide ${n + 1}`} onClick={() => go(n)} className="min-h-11 min-w-11 grid place-items-center">
            <span className={`block h-2 rounded-full transition-all ${n === i ? "w-8 bg-amber" : "w-2 bg-white/60"}`} />
          </button>
        ))}
      </div>
      <div key={`${i}-${paused}`} className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
        <div className="h-full bg-amber origin-left" style={{ animation: paused ? "none" : `progress ${MS}ms linear forwards`, transform: paused ? "scaleX(0)" : undefined }} />
      </div>
    </section>
  );
}

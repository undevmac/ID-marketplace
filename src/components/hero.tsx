"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SLIDES = [
  { h: "Badges your team will actually wear", s: "Staff ID cards printed on durable PVC, from 1 card.", href: "/#badges", cta: "Shop badges", bg: "from-navy to-navy2" },
  { h: "Student IDs, ready for the term", s: "Photo cards with student numbers, barcodes or QR.", href: "/#badges", cta: "Student IDs", bg: "from-navy2 to-indigo-700" },
  { h: "Props for film, games & cosplay", s: "Fictional issuers. Always marked PROP – NOT A GOVERNMENT ID.", href: "/#props", cta: "See props", bg: "from-purple-800 to-fuchsia-600" },
];
const MS = 6000;

export default function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  // Auto-advance; progress bar is a CSS animation re-keyed per slide.
  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off") return;
    const t = setTimeout(() => go((i + 1) % SLIDES.length), MS);
    return () => clearTimeout(t);
  });

  const go = (n: number) => { setI(n); track.current?.scrollTo({ left: n * track.current.clientWidth, behavior: "smooth" }); };
  // Swipe (native scroll-snap) -> sync active slide.
  const onScroll = () => { const t = track.current!; const n = Math.round(t.scrollLeft / t.clientWidth); if (n !== i) setI(n); };

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="relative"
      onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
      <div ref={track} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {SLIDES.map((s, n) => (
          <div key={n} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${SLIDES.length}`} id={`slide-${n}`}
            className={`snap-center shrink-0 w-full h-[70vh] min-h-[420px] max-h-[620px] relative overflow-hidden text-white ${n === i ? "slide-active" : ""}`}>
            <div className={`kb absolute inset-0 bg-gradient-to-br ${s.bg}`} />
            <div className="relative max-w-6xl mx-auto h-full px-4 flex flex-col justify-center gap-4 stagger">
              <h1 style={{ "--i": 0 } as React.CSSProperties} className="font-display font-extrabold text-4xl sm:text-6xl max-w-2xl leading-tight">{s.h}</h1>
              <p style={{ "--i": 1 } as React.CSSProperties} className="text-lg max-w-xl text-white/85">{s.s}</p>
              <Link style={{ "--i": 2 } as React.CSSProperties} href={s.href} className="self-start min-h-11 px-6 grid place-items-center rounded-full bg-amber text-ink font-bold">{s.cta}</Link>
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

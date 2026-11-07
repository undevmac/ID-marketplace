"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "./cart";

export default function Header({ children }: { children?: ReactNode }) {
  const { lines, bump } = useCart();
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const bar = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [off, setOff] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read saved pref after mount
    setOff(document.documentElement.dataset.motion === "off");
    let t = 0;
    const on = () => {
      if (t) return;
      t = requestAnimationFrame(() => { // throttled to one update per frame
        t = 0;
        const h = document.documentElement;
        bar.current!.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`;
        setScrolled(h.scrollTop > 8);
      });
    };
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  const toggle = () => {
    const next = !off; setOff(next);
    document.documentElement.dataset.motion = next ? "off" : "on";
    try { localStorage.motion = next ? "off" : "on"; } catch {}
    dispatchEvent(new Event("motionchange"));
  };

  return (
    <header className={`sticky top-0 z-50 bg-navy text-white h-16 transition-shadow ${scrolled ? "shadow-lg" : ""}`}>
      <div ref={bar} className="absolute bottom-0 left-0 right-0 h-1 bg-amber origin-left" style={{ transform: "scaleX(0)" }} />
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold min-h-11 flex items-center">Badge<span className="text-amber">Works</span></Link>
        <nav className="flex items-center gap-1">
          {/* desktop: inline page links. mobile: dropdown (same links) */}
          <div className="hidden md:flex items-center">{children}</div>
          <details className="md:hidden relative" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) e.currentTarget.open = false; }}>
            <summary aria-label="Menu" className="min-h-11 min-w-11 grid place-items-center list-none cursor-pointer rounded hover:bg-white/10 text-2xl">☰</summary>
            <div className="absolute right-0 top-12 w-56 bg-navy rounded-xl shadow-xl p-2 flex flex-col">{children}</div>
          </details>
          <button onClick={toggle} aria-pressed={!off} aria-label={`Motion ${off ? "off" : "on"}`} title={`Motion ${off ? "off" : "on"}`} className="min-h-11 min-w-11 px-3 text-lg rounded hover:bg-white/10">
            {off ? "⏸" : "✨"}
          </button>
          <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative min-h-11 min-w-11 flex items-center justify-center rounded hover:bg-white/10">
            <span id="cart-icon" key={`i${bump}`} className={`text-2xl ${bump ? "wiggle" : ""}`}>🛒</span>
            {count > 0 && <span key={`b${bump}`} className={`absolute top-0.5 right-0.5 bg-amber text-ink text-xs font-bold rounded-full min-w-5 h-5 grid place-items-center px-1 ${bump ? "pop" : ""}`}>{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}

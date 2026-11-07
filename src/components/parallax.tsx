"use client";
import { useEffect, useRef } from "react";

// Background layer that drifts slower than the page. Transform only; idle when off-screen.
export default function Parallax({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!, box = el.parentElement!;
    let vis = false, raf = 0;
    const tick = () => {
      raf = 0;
      if (!vis || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off") return;
      el.style.transform = `translate3d(0,${box.getBoundingClientRect().top * -0.15}px,0) scale(1.25)`;
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; go(); });
    io.observe(box);
    addEventListener("scroll", go, { passive: true });
    return () => { io.disconnect(); removeEventListener("scroll", go); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} className="absolute inset-0 bg-gradient-to-br from-navy to-navy2 will-change-transform">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />}
      {src && <div className="absolute inset-0 bg-navy/50" />}
    </div>
  );
}

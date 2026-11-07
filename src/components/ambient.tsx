"use client";
import { useEffect, useRef } from "react";

// Theme: holographic sparkles drifting like laminate glints on a card.
// Reacts to scroll speed, pointer and taps. Paused when tab hidden / motion off.
export default function Ambient() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!, cx = cv.getContext("2d")!;
    const phone = innerWidth < 640;
    const N = phone ? 24 : 60;
    const dpr = Math.min(2, devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0, boost = 0, lastY = scrollY, px = -999, py = -999;
    const resize = () => { w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const ps = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 2.5, vy: .15 + Math.random() * .4, vx: 0, hue: 35 + Math.random() * 190 }));

    const off = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    const frame = () => {
      raf = 0;
      if (off() || document.hidden) { cx.clearRect(0, 0, w, h); return; }
      boost = Math.max(0, boost * .92);
      cx.clearRect(0, 0, w, h);
      for (const p of ps) {
        const dx = p.x - px, dy = p.y - py, d = Math.hypot(dx, dy);
        if (d < 90) { p.vx += dx / d * .6; }          // scatter from pointer/tap
        p.vx *= .94;
        p.x += p.vx + Math.sin(p.y / 60) * .2;
        p.y -= p.vy * (1 + boost);
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
        cx.fillStyle = `hsla(${p.hue},90%,65%,.55)`;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const onScroll = () => { boost = Math.min(4, boost + Math.abs(scrollY - lastY) / 40); lastY = scrollY; start(); };
    const onPtr = (e: PointerEvent) => { px = e.clientX; py = e.clientY; };
    const onTilt = (e: DeviceOrientationEvent) => { const g = e.gamma ?? 0; for (const p of ps) p.vx += g / 600; };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onPtr, { passive: true });
    addEventListener("pointerdown", onPtr, { passive: true });
    addEventListener("deviceorientation", onTilt);
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", start);
    addEventListener("motionchange", start);
    start();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll); removeEventListener("pointermove", onPtr); removeEventListener("pointerdown", onPtr);
      removeEventListener("deviceorientation", onTilt); removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", start); removeEventListener("motionchange", start);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

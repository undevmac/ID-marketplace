"use client";
import { useEffect } from "react";

// Adds .in to .reveal elements as they scroll into view.
// A MutationObserver also catches content that streams in AFTER hydration (slow phone connections) and
// content from client-side navigation, so nothing can stay stuck at opacity 0.
export default function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.05 });
    let raf = 0;
    const scan = () => { raf = 0; document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el)); };
    const queue = () => { if (!raf) raf = requestAnimationFrame(scan); };
    scan();
    const mo = new MutationObserver(queue);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return null;
}

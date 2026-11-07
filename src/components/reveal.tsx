"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Adds .in to .reveal elements as they scroll into view; rescans on route change.
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}

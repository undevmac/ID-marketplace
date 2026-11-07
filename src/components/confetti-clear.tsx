"use client";
import { useEffect } from "react";
import { useCart } from "./cart";

// Clears the cart once and shows a themed sparkle burst (transform/opacity only).
export default function ConfettiClear() {
  const { clear } = useCart();
  useEffect(() => { clear(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div aria-hidden className="relative h-0">
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} className="absolute left-1/2 top-0 w-2 h-2 rounded-full"
          style={{ background: `hsl(${(i * 47) % 360} 90% 60%)`, animation: `burst 1.2s ${i * 15}ms var(--ease) both`, ["--x" as string]: `${Math.cos(i) * 140}px`, ["--y" as string]: `${Math.sin(i) * 100 + 40}px` }} />
      ))}
      <style>{`@keyframes burst{from{transform:translate(0,0)}to{transform:translate(var(--x),var(--y));opacity:0}}`}</style>
    </div>
  );
}

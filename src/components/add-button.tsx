"use client";
import { useRef } from "react";
import { flyToCart, useCart } from "./cart";
import type { Product } from "@/lib/supabase";

// Pass sourceId = id of the element whose ghost should fly (the card art).
export default function AddButton({ p, sourceId, className = "", label = "Add to cart" }: { p: Product; sourceId: string; className?: string; label?: string }) {
  const { add } = useCart();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => { flyToCart(document.getElementById(sourceId)); add({ slug: p.slug, name: p.name, price_cents: p.price_cents }); }}
      className={`min-h-11 px-5 rounded-full bg-amber text-ink font-bold hover:brightness-95 active:scale-95 transition ${className}`}
    >
      {label}
    </button>
  );
}

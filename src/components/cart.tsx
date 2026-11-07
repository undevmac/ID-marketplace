"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Display-only snapshot. The server re-reads prices from the DB at checkout.
export type Line = { slug: string; name: string; price_cents: number; qty: number };
type Ctx = { lines: Line[]; bump: number; add: (l: Omit<Line, "qty">, qty?: number) => void; setQty: (slug: string, q: number) => void; clear: () => void };

const C = createContext<Ctx>(null!);
export const useCart = () => useContext(C);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [bump, setBump] = useState(0); // unique key to retrigger cart-icon animation

  useEffect(() => {
    try { setLines(JSON.parse(localStorage.cart || "[]")); } catch {}
  }, []);
  const save = (l: Line[]) => { setLines(l); try { localStorage.cart = JSON.stringify(l); } catch {} };

  const add: Ctx["add"] = (p, qty = 1) => {
    const ex = lines.find((l) => l.slug === p.slug);
    save(ex ? lines.map((l) => (l.slug === p.slug ? { ...l, qty: Math.min(5000, l.qty + qty) } : l)) : [...lines, { ...p, qty }]);
    setBump((b) => b + 1);
  };
  const setQty = (slug: string, q: number) => save(q <= 0 ? lines.filter((l) => l.slug !== slug) : lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(5000, q) } : l)));

  return <C.Provider value={{ lines, bump, add, setQty, clear: () => save([]) }}>{children}</C.Provider>;
}

// Ghost of the source element flies to the cart icon (transform/opacity only).
export function flyToCart(from: HTMLElement | null) {
  const to = document.getElementById("cart-icon");
  if (!from || !to || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off") return;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const g = from.cloneNode(true) as HTMLElement;
  Object.assign(g.style, { position: "fixed", left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px", margin: 0, zIndex: "100", pointerEvents: "none" });
  document.body.appendChild(g);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  g.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.1)`, opacity: .3 }], { duration: 700, easing: "cubic-bezier(.5,0,.8,.4)" }).onfinish = () => g.remove();
}

"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useCart } from "@/components/cart";
import { money } from "@/lib/supabase";
import { placeOrder } from "@/app/actions";

const field = "w-full min-h-11 rounded-lg border border-black/20 px-3 bg-white";
// Green tick appears once the field inside is valid (and has been touched).
const Tick = () => <span aria-hidden className="hidden group-has-[input:user-valid]:inline group-has-[textarea:user-valid]:inline text-green-600 font-bold ml-1">✓</span>;

export default function CartPage() {
  const { lines, setQty } = useCart();
  const [leaving, setLeaving] = useState<string | null>(null);
  const remove = (slug: string) => { setLeaving(slug); setTimeout(() => { setQty(slug, 0); setLeaving(null); }, 250); };
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const total = lines.reduce((n, l) => n + l.qty * l.price_cents, 0); // display only; server recomputes

  if (lines.length === 0)
    return <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4"><h1 className="font-display text-3xl font-bold">Your cart is empty</h1><Link href="/" className="inline-grid place-items-center min-h-11 px-6 rounded-full bg-amber font-bold">Browse cards</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="font-display text-3xl font-bold">Cart</h1>
      <ul className="space-y-3">
        {lines.map((l) => (
          <li key={l.slug} className={`bg-white rounded-xl p-4 flex items-center gap-3 justify-between transition-[transform,opacity] duration-250 ${leaving === l.slug ? "translate-x-12 opacity-0" : ""}`}>
            <div className="min-w-0"><p className="font-bold truncate">{l.name}</p><p className="text-sm text-black/60">{money(l.price_cents)} each</p></div>
            <div className="flex items-center gap-1">
              <button aria-label="Decrease" onClick={() => (l.qty <= 1 ? remove(l.slug) : setQty(l.slug, l.qty - 1))} className="min-h-11 min-w-11 rounded-full bg-black/5 text-xl">−</button>
              <span key={l.qty} className="pop w-10 text-center font-bold tabular-nums">{l.qty}</span>
              <button aria-label="Increase" onClick={() => setQty(l.slug, l.qty + 1)} className="min-h-11 min-w-11 rounded-full bg-black/5 text-xl">+</button>
            </div>
            <span className="w-20 text-right font-bold tabular-nums">{money(l.qty * l.price_cents)}</span>
            <button aria-label={`Remove ${l.name}`} onClick={() => remove(l.slug)} className="min-h-11 min-w-11 rounded-full hover:bg-black/5">✕</button>
          </li>
        ))}
      </ul>
      <p className="text-right font-display text-2xl font-bold">Total <span key={total} className="pop inline-block">{money(total)}</span></p>

      <form action={action} className="bg-white rounded-xl p-4 space-y-3">
        <h2 className="font-display text-xl font-bold">Your organization</h2>
        <input type="hidden" name="cart" value={JSON.stringify(lines.map(({ slug, qty }) => ({ slug, qty })))} />
        <label className="group block">Organization<Tick /><input name="org" required autoComplete="organization" className={field} /></label>
        <label className="group block">Contact name<Tick /><input name="name" required autoComplete="name" className={field} /></label>
        <label className="group block">Email<Tick /><input name="email" type="email" required autoComplete="email" className={field} /></label>
        <label className="group block">Notes (logo, colours, quantities per person)<Tick /><textarea name="notes" rows={3} className={`${field} py-2`} /></label>
        {state?.error && <p role="alert" className="text-red-700 font-bold">{state.error}</p>}
        <button type="submit" disabled={pending} className="w-full min-h-12 rounded-full bg-navy text-white font-bold disabled:opacity-60">{pending ? "Placing order…" : "Place order"}</button>
        <p className="text-xs text-black/60">Final price is confirmed by us from current catalogue prices. We email a free proof before printing.</p>
      </form>
    </div>
  );
}

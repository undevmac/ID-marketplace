"use client";
import { useCart } from "./cart";

// Floating WhatsApp chat button, shown on every page once a number is saved in Settings.
export default function WaFloat() {
  const { wa } = useCart();
  if (!wa) return null;
  return (
    <a href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi, I have a question about your cards.")}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 min-h-12 px-5 rounded-full bg-[#25D366] text-white font-bold shadow-lg grid place-items-center hover:brightness-95 active:scale-95 transition">
      WhatsApp
    </a>
  );
}

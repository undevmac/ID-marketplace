import { Suspense, type ReactNode } from "react";
import { CartProvider } from "@/components/cart";
import Header from "@/components/header";
import Ambient from "@/components/ambient";
import Reveal from "@/components/reveal";
import NavLinks from "@/components/nav-links";
import Footer from "@/components/footer";
import Brand from "@/components/brand";

// Customer-facing chrome. The admin area does NOT use this layout.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Ambient />
      <Header brand={<Brand />}><Suspense fallback={null}><NavLinks className="min-h-11 px-3 flex items-center rounded hover:bg-white/10 text-sm whitespace-nowrap" /></Suspense></Header>
      <main className="flex-1 relative z-10">{children}</main>
      <Suspense fallback={null}><Footer /></Suspense>
      <Suspense fallback={null}><Reveal /></Suspense>
    </CartProvider>
  );
}

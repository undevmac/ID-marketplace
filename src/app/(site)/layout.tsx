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
      <Header brand={<Brand />} desktopNav={<Suspense fallback={null}><NavLinks variant="desktop" /></Suspense>}><Suspense fallback={null}><NavLinks variant="mobile" /></Suspense></Header>
      <main className="flex-1 relative z-10">{children}</main>
      <Suspense fallback={null}><Footer /></Suspense>
      <Suspense fallback={null}><Reveal /></Suspense>
    </CartProvider>
  );
}

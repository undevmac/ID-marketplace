import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import Header from "@/components/header";
import Ambient from "@/components/ambient";
import Reveal from "@/components/reveal";
import NavLinks from "@/components/nav-links";
import Footer from "@/components/footer";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BadgeWorks – ID cards & badges for organizations",
  description: "Custom printed staff badges, student ID cards and visitor passes. Plus clearly-marked prop cards for film, games and cosplay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* ponytail: sets .js + saved motion pref before paint, so reveals never flash */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js');try{if(localStorage.motion==='off')document.documentElement.dataset.motion='off'}catch(e){}` }} />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <CartProvider>
          <Ambient />
          <Header><Suspense fallback={null}><NavLinks className="min-h-11 px-3 flex items-center rounded hover:bg-white/10 text-sm whitespace-nowrap" /></Suspense></Header>
          <main className="flex-1 relative z-10">{children}</main>
          <Suspense fallback={null}><Footer /></Suspense>
        </CartProvider>
        <Suspense fallback={null}><Reveal /></Suspense>
      </body>
    </html>
  );
}

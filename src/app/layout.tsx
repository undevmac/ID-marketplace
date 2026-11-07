import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import Header from "@/components/header";
import Ambient from "@/components/ambient";
import Reveal from "@/components/reveal";

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
          <Header />
          <main className="flex-1 relative z-10">{children}</main>
          <footer className="relative z-10 bg-navy text-white/80 mt-16 py-10 px-4 text-sm">
            <div className="max-w-6xl mx-auto space-y-2">
              <p className="font-display text-xl text-white">BadgeWorks</p>
              <p>Prop cards are novelty items for film, games and cosplay. They carry a permanent &ldquo;PROP – NOT A GOVERNMENT ID&rdquo; mark and use fictional issuers only.</p>
              <p>We never produce government-issued identity documents.</p>
            </div>
          </footer>
        </CartProvider>
        <Suspense fallback={null}><Reveal /></Suspense>
      </body>
    </html>
  );
}

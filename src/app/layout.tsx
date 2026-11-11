import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { getSiteName } from "@/lib/brand";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const name = await getSiteName();
  return {
    title: { default: `${name} – ID cards & badges for organizations`, template: `%s | ${name}` },
    description: "Custom printed staff badges, student ID cards and visitor passes. Plus clearly-marked prop cards for film, games and cosplay.",
  };
}

// Bare shell only. Storefront chrome lives in (site)/layout.tsx, admin chrome in admin/(panel)/layout.tsx.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* ponytail: sets .js + saved motion pref before paint, so reveals never flash */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js');try{if(localStorage.motion==='off')document.documentElement.dataset.motion='off'}catch(e){}` }} />
      </head>
      <body className="min-h-screen flex flex-col font-sans">{children}</body>
    </html>
  );
}

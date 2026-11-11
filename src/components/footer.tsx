import Link from "next/link";
import { getContent } from "@/lib/content";
import { getNav } from "@/lib/pages";
import Brand from "./brand";

export default async function Footer() {
  const [c, nav] = await Promise.all([getContent(), getNav()]);
  return (
    <footer className="relative z-10 mt-16">
      {/* Flourish: two drifting wave layers (transform only) */}
      <div aria-hidden className="overflow-hidden h-10 md:h-14 text-navy">
        <svg viewBox="0 0 2880 80" preserveAspectRatio="none" className="w-[200%] h-full fill-current footer-wave">
          <path d="M0,40 C180,80 360,0 720,40 C1080,80 1260,0 1440,40 C1620,80 1800,0 2160,40 C2520,80 2700,0 2880,40 L2880,80 L0,80 Z" />
        </svg>
      </div>
      <div className="bg-navy text-white/80 py-10 px-4 text-sm">
        <div className="max-w-6xl mx-auto space-y-4">
          <p className="font-display text-xl text-white"><Brand /></p>
          <nav className="flex flex-wrap gap-x-5">
            {nav.map((p) => <Link key={p.slug} href={`/${p.slug}`} className="min-h-11 flex items-center underline-offset-4 hover:underline">{p.title}</Link>)}
          </nav>
          {/* fixed legal line: not editable, so the prop disclaimer can't be removed from the admin */}
          <p>Prop cards are novelty items for film, games and cosplay. They carry a permanent &ldquo;PROP – NOT A GOVERNMENT ID&rdquo; mark and use fictional issuers only.</p>
          <p>{c.footer_text}</p>
        </div>
      </div>
    </footer>
  );
}

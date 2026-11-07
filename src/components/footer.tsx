import { getContent } from "@/lib/content";

export default async function Footer() {
  const c = await getContent();
  return (
    <footer className="relative z-10 bg-navy text-white/80 mt-16 py-10 px-4 text-sm">
      <div className="max-w-6xl mx-auto space-y-2">
        <p className="font-display text-xl text-white">BadgeWorks</p>
        {/* fixed legal line: not editable, so the prop disclaimer can't be removed from the admin */}
        <p>Prop cards are novelty items for film, games and cosplay. They carry a permanent &ldquo;PROP – NOT A GOVERNMENT ID&rdquo; mark and use fictional issuers only.</p>
        <p>{c.footer_text}</p>
      </div>
    </footer>
  );
}

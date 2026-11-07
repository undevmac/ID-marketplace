import type { Product } from "@/lib/supabase";

// CSS-drawn card, so there are no photos to source. Prop cards always carry the watermark.
export default function CardArt({ p, big }: { p: Pick<Product, "name" | "kind"> & { image?: string }; big?: boolean }) {
  const prop = p.kind === "prop";
  return (
    <div className={`relative overflow-hidden rounded-2xl aspect-[1.586] w-full text-white shadow-md ${prop ? "bg-gradient-to-br from-purple-700 to-fuchsia-500" : "bg-gradient-to-br from-navy to-navy2"}`}>
      {p.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : <>
      <div className="absolute inset-x-0 top-0 h-1/4 bg-amber/90" />
      <div className="absolute left-[6%] top-[34%] w-[26%] aspect-square rounded-lg bg-white/20 grid place-items-center text-3xl">👤</div>
      <div className="absolute left-[38%] top-[36%] right-[6%] space-y-2">
        <div className="h-3 rounded bg-white/70 w-4/5" /><div className="h-2 rounded bg-white/40 w-3/5" /><div className="h-2 rounded bg-white/40 w-2/5" />
      </div>
      <div className={`absolute left-[6%] bottom-[8%] font-display font-bold leading-tight ${big ? "text-lg" : "text-xs"}`}>{p.name.replace("Prop: ", "")}</div>
      </>}
      {/* watermark sits outside the image branch so an uploaded image can never remove it */}
      {prop && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className={`-rotate-12 border-2 border-white/90 text-white/90 font-black tracking-widest px-2 bg-black/30 ${big ? "text-xl" : "text-[10px]"}`}>PROP – NOT A GOVERNMENT ID</span>
        </div>
      )}
    </div>
  );
}

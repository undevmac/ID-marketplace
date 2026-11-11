import type { ReactNode } from "react";

export const input = "w-full min-h-11 rounded-lg border border-black/20 px-3 bg-white font-normal";

// Standard page header for every admin screen.
export function Head({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {sub && <p className="text-black/70 mt-1 max-w-2xl">{sub}</p>}
      </div>
      <div className="flex gap-2 items-center flex-wrap">{children}</div>
    </div>
  );
}

export const btnPrimary = "min-h-11 px-5 inline-grid place-items-center rounded-full bg-navy text-white font-bold hover:brightness-110";
export const btnGhost = "min-h-11 px-4 inline-grid place-items-center rounded-full border border-black/25 font-bold hover:bg-black/5";
export const card = "bg-white rounded-2xl p-5 shadow-sm";

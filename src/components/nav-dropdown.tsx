"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

// Desktop dropdown: opens on mouse hover, or on click/Enter for touch and keyboard. Esc, outside click, focus-out and picking a link close it.
export default function NavDropdown({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const byHover = useRef(false); // a click right after a hover-open shouldn't immediately close it
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") { byHover.current = true; setOpen(true); } }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") { byHover.current = false; setOpen(false); } }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <button type="button" aria-expanded={open} aria-controls={id}
        onClick={() => { if (byHover.current) byHover.current = false; else setOpen((o) => !o); }}
        className="min-h-11 px-3 flex items-center gap-1 rounded hover:bg-white/10 text-sm whitespace-nowrap">
        {label}<span aria-hidden className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {/* pt-1 bridges the gap so the pointer can travel from button to panel without closing it */}
      <div id={id} hidden={!open} onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }} className="absolute left-0 top-full pt-1 min-w-56 z-50">
        <div className="bg-navy rounded-xl shadow-xl p-2 flex flex-col border border-white/10">{children}</div>
      </div>
    </div>
  );
}

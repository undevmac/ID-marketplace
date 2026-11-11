"use client";
import { useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { localPart } from "@/lib/phone";

const box = "min-h-11 rounded-lg border border-black/20 px-3 bg-white font-normal";

// Country dropdown + number. On blur the number is cleaned (no +, spaces, 0 or repeated country code).
export default function PhoneField({ cc: cc0, national: n0 }: { cc: string; national: string }) {
  const [cc, setCc] = useState(cc0 || "");
  const [n, setN] = useState(n0);
  const clean = (code: string, v: string) => setN(localPart(code, v));
  return (
    <div className="space-y-1">
      <span className="block font-medium">WhatsApp number</span>
      <div className="flex gap-2">
        <select name="whatsapp_cc" value={cc} onChange={(e) => { setCc(e.target.value); clean(e.target.value, n); }} aria-label="Country code" className={`${box} w-40 sm:w-56 shrink-0`}>
          <option value="">Country…</option>
          {COUNTRIES.map(([name, code]) => <option key={name} value={code}>{name} (+{code})</option>)}
        </select>
        <input name="whatsapp_national" inputMode="tel" autoComplete="tel-national" value={n} onChange={(e) => setN(e.target.value)} onBlur={() => clean(cc, n)} placeholder="8031234567" maxLength={20} className={`${box} min-w-0 flex-1`} />
      </div>
      {cc && n && <p className="text-xs text-black/60">Customers will chat with +{cc} {n}</p>}
    </div>
  );
}

// Pure helpers (used by the admin form in the browser and by the save action on the server).
// Cleans what the admin typed: drops +, spaces, dashes, a leading 00 or trunk 0, and the country code if it was typed again.
export function localPart(cc: string, raw: string): string {
  let d = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (cc && d.startsWith(cc) && d.length - cc.length >= 7) d = d.slice(cc.length).replace(/^0+/, "");
  return d;
}

// Full WhatsApp number (country code + number, digits only). "" = empty, null = invalid.
export function waNumber(cc: string, raw: string): string | null {
  const n = localPart(cc, raw);
  if (!n) return "";
  const full = cc + n;
  return /^\d{8,15}$/.test(full) ? full : null;
}

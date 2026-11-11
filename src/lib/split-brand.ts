// Two-tone logo: "BadgeWorks" -> Badge + Works, "Acme Cards" -> Acme + Cards, "Acme" -> plain.
export function splitBrand(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) { const last = words.pop()!; return [words.join(" ") + " ", last]; }
  const m = name.match(/^(.*[a-z0-9])([A-Z][a-z0-9]+)$/);
  return m ? [m[1], m[2]] : [name, ""];
}

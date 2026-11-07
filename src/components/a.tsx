import Link from "next/link";
import type { ComponentProps } from "react";
import { safeHref } from "@/lib/blocks";

// Link that is client-routed for internal paths and a plain <a> for https/mailto. Unsafe hrefs render nothing clickable.
export default function A({ href, ...p }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const h = safeHref(href);
  if (!h) return <span className={p.className} style={p.style}>{p.children}</span>;
  return h.startsWith("/") ? <Link href={h} {...p} /> : <a href={h} {...p} />;
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Blocks from "@/components/blocks";
import { getPage } from "@/lib/pages";

async function Body({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params;
  const p = await getPage(slug);
  if (!p) notFound();
  return <Blocks blocks={p.blocks} />;
}

export default function Page({ params }: PageProps<"/[slug]">) {
  return <Suspense fallback={<div className="skeleton h-[60vh]" />}><Body params={params} /></Suspense>;
}

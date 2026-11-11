import { Suspense } from "react";
import Blocks from "@/components/blocks";
import { getPage } from "@/lib/pages";

async function Home() {
  const p = await getPage("home", { preview: true }); // home can't be unpublished
  return <Blocks blocks={p!.blocks} />;
}

export default function Page() {
  return <Suspense fallback={<div className="skeleton h-[60vh]" />}><Home /></Suspense>;
}

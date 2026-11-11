import { Suspense, type ReactNode } from "react";
import AdminNav from "@/components/admin-nav";
import Brand from "@/components/brand";
import { requireAdmin } from "@/lib/auth";

async function Gate({ children }: { children: ReactNode }) {
  await requireAdmin(); // pages repeat this check themselves (layouts don't re-run on client navigation)
  return <>{children}</>;
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:flex">
      <Suspense fallback={<div className="bg-navy h-14 md:w-60 md:h-screen" />}><AdminNav brand={<Brand />} /></Suspense>
      <main className="flex-1 min-w-0 p-4 pb-24 md:p-8 md:pb-8 max-w-6xl">
        <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}><Gate>{children}</Gate></Suspense>
      </main>
    </div>
  );
}

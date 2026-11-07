import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { getPage } from "@/lib/pages";
import PageEditor from "@/components/page-editor";

export const metadata = { robots: { index: false } };

async function Editor({ params }: Pick<PageProps<"/admin/pages/[slug]">, "params">) {
  if (!(await getAdmin())) redirect("/admin/login");
  const { slug } = await params;
  const p = await getPage(slug, { preview: true });
  if (!p) notFound();
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="font-display text-3xl font-bold mb-4">Edit page: {p.title}</h1>
      <PageEditor initial={p} />
    </div>
  );
}

export default function Page({ params }: PageProps<"/admin/pages/[slug]">) {
  return <Suspense fallback={<div className="max-w-4xl mx-auto p-6"><div className="skeleton h-40 rounded-2xl" /></div>}><Editor params={params} /></Suspense>;
}

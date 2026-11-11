import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPage } from "@/lib/pages";
import { listCategories } from "@/lib/categories";
import PageEditor from "@/components/page-editor";

export default async function EditPage({ params }: PageProps<"/admin/pages/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const [p, cats] = await Promise.all([getPage(slug, { preview: true }), listCategories()]);
  if (!p) notFound();
  return (
    <>
      <h1 className="font-display text-3xl font-bold mb-4">Edit page: {p.title}</h1>
      <PageEditor initial={p} cats={cats.map((c) => [c.slug, c.label])} />
    </>
  );
}

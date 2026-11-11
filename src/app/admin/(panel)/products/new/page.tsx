import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/categories";
import ProductForm from "@/components/product-form";
import { Head, btnGhost } from "@/components/admin-ui";

export default async function NewProduct({ searchParams }: PageProps<"/admin/products/new">) {
  await requireAdmin();
  const sp = await searchParams;
  const cats = await listCategories();
  return (
    <>
      <Head title="Add product" sub="It appears on the website as soon as you save, unless you untick “Visible in store”."><Link href="/admin/products" className={btnGhost}>← All products</Link></Head>
      <div className="max-w-2xl"><ProductForm cats={cats} preset={typeof sp.category === "string" ? sp.category : undefined} /></div>
    </>
  );
}

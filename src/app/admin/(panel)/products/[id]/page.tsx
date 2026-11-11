import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { admin } from "@/lib/supabase";
import { listCategories } from "@/lib/categories";
import ProductForm, { type AdminProduct } from "@/components/product-form";
import { DeleteForm } from "@/components/admin-forms";
import { Head, btnGhost, card } from "@/components/admin-ui";
import { deleteProduct } from "../../../actions";

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [cats, { data }] = await Promise.all([listCategories(), admin().from("bw_products").select("*").eq("id", id).maybeSingle()]);
  const p = data as AdminProduct | null;
  if (!p) notFound();
  return (
    <>
      <Head title={`Edit: ${p.name}`}>
        <Link href="/admin/products" className={btnGhost}>← All products</Link>
        {p.active && <Link href={`/products/${p.slug}`} target="_blank" className={btnGhost}>View on site ↗</Link>}
      </Head>
      <div className="max-w-2xl space-y-6">
        <ProductForm product={p} cats={cats} />
        <section className={card}>
          <h2 className="font-bold mb-1">Delete product</h2>
          <p className="text-sm text-black/60 mb-3">To just take it off the website, untick &ldquo;Visible in store&rdquo; above. Products that customers have already ordered can&rsquo;t be deleted.</p>
          <DeleteForm action={deleteProduct} name="id" value={p.id} label="Delete product" message={`Delete “${p.name}” permanently?`} />
        </section>
      </div>
    </>
  );
}

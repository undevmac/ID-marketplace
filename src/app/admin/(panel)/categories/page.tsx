import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { admin } from "@/lib/supabase";
import { listCategories } from "@/lib/categories";
import { DeleteForm, ImageField, SaveForm } from "@/components/admin-forms";
import { Head, btnGhost, card, input } from "@/components/admin-ui";
import { createCategory, deleteCategory, updateCategory } from "../../actions";

export default async function Categories() {
  await requireAdmin();
  const [cats, { data }] = await Promise.all([listCategories(), admin().from("bw_products").select("category")]);
  const count = (slug: string) => (data ?? []).filter((p) => p.category === slug).length;

  return (
    <>
      <Head title="Categories" sub="Every category automatically gets its own page on the website (and a tile on the home page). Deleting a category removes its page." />

      <SaveForm action={createCategory} label="Add category" className="bg-amber/20 rounded-2xl p-5 space-y-3 mb-8">
        <h2 className="font-display text-xl font-bold">Add a category</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block font-medium">Name<input name="label" required maxLength={60} className={input} placeholder="e.g. Lanyards" /></label>
          <label className="block font-medium">Short description<input name="description" maxLength={300} className={input} placeholder="Shown on the category page and tile" /></label>
        </div>
        <ImageField name="image" label="Tile image (optional)" defaultValue="" />
        <label className="flex items-start gap-2 font-medium"><input type="checkbox" name="is_prop" className="size-5 mt-0.5" /><span>Novelty / prop category<span className="block text-xs font-normal text-black/60">Every product here always carries a “PROP – NOT A GOVERNMENT ID” mark. Tick this for film, game or cosplay items.</span></span></label>
      </SaveForm>

      <h2 className="font-display text-xl font-bold mb-3">Your categories ({cats.length})</h2>
      {cats.length === 0 && <p className={card}>No categories yet. Add one above to start adding products.</p>}
      <ul className="space-y-4">
        {cats.map((c) => (
          <li key={c.slug} className={`${card} space-y-3`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-bold">{c.label}</p>
                <p className="text-xs text-black/60">/{c.slug} · {count(c.slug)} product{count(c.slug) === 1 ? "" : "s"}{c.is_prop ? " · prop category" : ""}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/admin/products?category=${c.slug}`} className={btnGhost}>Products</Link>
                <Link href={`/admin/pages/${c.slug}`} className={btnGhost}>Edit page</Link>
                <Link href={`/${c.slug}`} target="_blank" className={btnGhost}>View ↗</Link>
              </div>
            </div>
            <SaveForm action={updateCategory} className="space-y-3 border-t pt-3">
              <input type="hidden" name="slug" value={c.slug} />
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block font-medium">Name<input name="label" required defaultValue={c.label} maxLength={60} className={input} /></label>
                <label className="block font-medium">Short description<input name="description" defaultValue={c.description} maxLength={300} className={input} /></label>
              </div>
              <ImageField name="image" label="Tile image (optional)" defaultValue={c.image} />
              <label className="flex items-center gap-2 min-h-11 font-medium"><input type="checkbox" name="is_prop" defaultChecked={c.is_prop} className="size-5" /> Novelty / prop category (always watermarked)</label>
            </SaveForm>
            <div className="border-t pt-3">
              <DeleteForm action={deleteCategory} name="slug" value={c.slug} label="Delete category" message={`Delete the category “${c.label}” and its page?`} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

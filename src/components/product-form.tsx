import Link from "next/link";
import { ImageField, SaveForm } from "./admin-forms";
import { input } from "./admin-ui";
import { saveProduct } from "@/app/admin/actions";
import type { Category } from "@/lib/categories";
import type { Product } from "@/lib/supabase";

export type AdminProduct = Product & { active: boolean };

// One form for both "add" and "edit". Prices are entered in dollars; the server stores cents.
export default function ProductForm({ product, cats, preset }: { product?: AdminProduct; cats: Category[]; preset?: string }) {
  if (cats.length === 0)
    return <p className="bg-amber/20 rounded-2xl p-5">You need a category before you can add products. <Link href="/admin/categories" className="underline font-bold">Create a category</Link></p>;
  return (
    <SaveForm action={saveProduct} label={product ? "Save product" : "Add product"} className="bg-white rounded-2xl p-5 space-y-4 shadow-sm">
      {product && <input type="hidden" name="id" value={product.id} />}
      <label className="block font-medium">Name<input name="name" required defaultValue={product?.name} className={input} /></label>
      <label className="block font-medium">Description<textarea name="description" rows={3} defaultValue={product?.description} className={`${input} py-2`} /></label>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="block font-medium">Price (USD)<input name="price" type="number" step="0.01" min="0.01" required defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""} className={input} /></label>
        <label className="block font-medium">Category
          <select name="category" defaultValue={product?.category ?? preset ?? cats[0].slug} className={input}>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select>
        </label>
        <label className="block font-medium">Badge (e.g. SALE)<input name="badge" defaultValue={product?.badge ?? ""} maxLength={20} className={input} /></label>
      </div>
      <ImageField name="image" label="Product image (optional, replaces the drawn card)" defaultValue={product?.image ?? ""} />
      <label className="flex items-center gap-2 min-h-11 font-medium"><input type="checkbox" name="active" defaultChecked={product ? product.active : true} className="size-5" /> Visible in store</label>
      <p className="text-xs text-black/60">Products in a prop category always carry the &ldquo;PROP – NOT A GOVERNMENT ID&rdquo; mark, including uploaded images.</p>
    </SaveForm>
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { admin } from "@/lib/supabase";
import { FIELDS, getContent } from "@/lib/content";
import { ImageField, SaveForm } from "@/components/admin-forms";
import { logout, saveContent, saveProduct } from "./actions";

export const metadata = { robots: { index: false } };

export default function AdminPage() {
  return <Suspense fallback={<div className="max-w-4xl mx-auto p-6"><div className="skeleton h-40 rounded-2xl" /></div>}><Dashboard /></Suspense>;
}

const input = "w-full min-h-11 rounded-lg border border-black/20 px-3 bg-white";

async function Dashboard() {
  if (!(await getAdmin())) redirect("/admin/login");
  const content = await getContent();
  const { data: products } = await admin().from("bw_products").select("*").order("created_at");
  const groups = [...new Set(FIELDS.map((f) => f.group))];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Site editor</h1>
        <form action={logout}><button className="min-h-11 px-4 underline">Log out</button></form>
      </div>
      <p className="text-black/70">Edit text and images below, then press Save. Changes go live immediately. <a href="/" target="_blank" className="underline">Open site ↗</a></p>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Page content</h2>
        {groups.map((g) => (
          <SaveForm key={g} action={saveContent} className="bg-white rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-lg">{g}</h3>
            {FIELDS.filter((f) => f.group === g).map((f) =>
              f.kind === "image" ? <ImageField key={f.key} name={f.key} label={f.label} defaultValue={content[f.key] === f.def ? "" : content[f.key]} />
              : f.kind === "long" ? <label key={f.key} className="block font-medium">{f.label}<textarea name={f.key} rows={f.key === "ticker" ? 6 : 3} defaultValue={content[f.key]} className={`${input} py-2 font-normal`} /></label>
              : <label key={f.key} className="block font-medium">{f.label}<input name={f.key} defaultValue={content[f.key]} className={`${input} font-normal`} /></label>
            )}
          </SaveForm>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Products</h2>
        {(products ?? []).map((p) => (
          <SaveForm key={p.id} action={saveProduct} className="bg-white rounded-2xl p-5 space-y-3">
            <input type="hidden" name="id" value={p.id} />
            <div className="flex items-center justify-between"><h3 className="font-bold">{p.name}</h3><span className="text-xs uppercase tracking-wide text-black/50">{p.kind}</span></div>
            <label className="block font-medium">Name<input name="name" defaultValue={p.name} className={`${input} font-normal`} /></label>
            <label className="block font-medium">Description<textarea name="description" rows={2} defaultValue={p.description} className={`${input} py-2 font-normal`} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block font-medium">Price (USD)<input name="price" type="number" step="0.01" min="0.01" defaultValue={(p.price_cents / 100).toFixed(2)} className={`${input} font-normal`} /></label>
              <label className="block font-medium">Badge (e.g. SALE)<input name="badge" defaultValue={p.badge ?? ""} maxLength={20} className={`${input} font-normal`} /></label>
            </div>
            <ImageField name="image" label="Product image (optional, replaces the drawn card)" defaultValue={p.image} />
            <label className="flex items-center gap-2 min-h-11"><input type="checkbox" name="active" defaultChecked={p.active} className="size-5" /> Visible in store</label>
            {p.kind === "prop" && <p className="text-xs text-black/60">The &ldquo;PROP – NOT A GOVERNMENT ID&rdquo; mark is always drawn over prop cards, including uploaded images.</p>}
          </SaveForm>
        ))}

        <SaveForm action={saveProduct} label="Add product" className="bg-amber/20 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold">Add a product</h3>
          <input type="hidden" name="id" value="" />
          <label className="block font-medium">Name<input name="name" required className={`${input} font-normal`} /></label>
          <label className="block font-medium">Description<textarea name="description" rows={2} className={`${input} py-2 font-normal`} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block font-medium">Price (USD)<input name="price" type="number" step="0.01" min="0.01" required className={`${input} font-normal`} /></label>
            <label className="block font-medium">Type<select name="kind" className={`${input} font-normal`}><option value="badge">Organization badge / ID</option><option value="prop">Prop card (fictional, marked)</option></select></label>
          </div>
          <ImageField name="image" label="Product image (optional)" defaultValue="" />
          <input type="hidden" name="active" value="on" />
        </SaveForm>
      </section>
    </div>
  );
}

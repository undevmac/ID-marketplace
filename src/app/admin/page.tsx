import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { admin } from "@/lib/supabase";
import { FIELDS, getContent } from "@/lib/content";
import { listPages } from "@/lib/pages";
import { CATEGORIES, DEFAULTS } from "@/lib/blocks";
import { ConfirmButton, ImageField, SaveForm } from "@/components/admin-forms";
import { createPage, logout, removePage, saveContent, saveProduct } from "./actions";

export const metadata = { robots: { index: false } };

export default function AdminPage() {
  return <Suspense fallback={<div className="max-w-4xl mx-auto p-6"><div className="skeleton h-40 rounded-2xl" /></div>}><Dashboard /></Suspense>;
}

const input = "w-full min-h-11 rounded-lg border border-black/20 px-3 bg-white font-normal";
const Cat = ({ value }: { value?: string }) => (
  <label className="block font-medium">Category
    <select name="category" defaultValue={value ?? CATEGORIES[0][0]} className={input}>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
  </label>
);

async function Dashboard() {
  if (!(await getAdmin())) redirect("/admin/login");
  const [content, pages] = await Promise.all([getContent(), listPages()]);
  const { data: products } = await admin().from("bw_products").select("*").order("created_at");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Site editor</h1>
        <form action={logout}><button className="min-h-11 px-4 underline">Log out</button></form>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Pages</h2>
        <p className="text-black/70">Every page is built from blocks. Open a page to add, reorder and edit blocks with a live preview.</p>
        <ul className="space-y-2">
          {pages.map((p) => (
            <li key={p.slug} className="bg-white rounded-xl p-3 flex items-center gap-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{p.title}</p>
                <p className="text-xs text-black/60">/{p.slug === "home" ? "" : p.slug} · {p.published ? "live" : "draft"}{p.nav ? " · in menu" : ""}{DEFAULTS[p.slug] ? "" : " · custom"}</p>
              </div>
              <Link href={`/admin/pages/${p.slug}`} className="min-h-11 px-5 grid place-items-center rounded-full bg-navy text-white font-bold">Edit</Link>
              <Link href={p.slug === "home" ? "/" : `/${p.slug}`} target="_blank" className="min-h-11 px-3 grid place-items-center underline">View</Link>
              {p.slug !== "home" || DEFAULTS.home ? (
                <form action={removePage}>
                  <input type="hidden" name="slug" value={p.slug} />
                  <ConfirmButton className="min-h-11 px-3 underline text-red-700" label={DEFAULTS[p.slug] ? "Reset" : "Delete"}
                    message={DEFAULTS[p.slug] ? "Discard your edits and restore the built-in version of this page?" : "Delete this page permanently?"} />
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        <SaveForm action={createPage} label="Create page" className="bg-amber/20 rounded-2xl p-4 space-y-2">
          <label className="block font-medium">New page title<input name="title" required maxLength={80} className={input} placeholder="e.g. Careers" /></label>
          <p className="text-xs text-black/60">New pages start as a draft. Publish them from the page editor.</p>
        </SaveForm>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Products</h2>
        {(products ?? []).map((p) => (
          <SaveForm key={p.id} action={saveProduct} className="bg-white rounded-2xl p-5 space-y-3">
            <input type="hidden" name="id" value={p.id} />
            <h3 className="font-bold">{p.name}</h3>
            <label className="block font-medium">Name<input name="name" defaultValue={p.name} className={input} /></label>
            <label className="block font-medium">Description<textarea name="description" rows={2} defaultValue={p.description} className={`${input} py-2`} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block font-medium">Price (USD)<input name="price" type="number" step="0.01" min="0.01" defaultValue={(p.price_cents / 100).toFixed(2)} className={input} /></label>
              <label className="block font-medium">Badge (e.g. SALE)<input name="badge" defaultValue={p.badge ?? ""} maxLength={20} className={input} /></label>
            </div>
            <Cat value={p.category} />
            <ImageField name="image" label="Product image (optional, replaces the drawn card)" defaultValue={p.image} />
            <label className="flex items-center gap-2 min-h-11"><input type="checkbox" name="active" defaultChecked={p.active} className="size-5" /> Visible in store</label>
            <p className="text-xs text-black/60">Products in the Prop cards category always carry the &ldquo;PROP – NOT A GOVERNMENT ID&rdquo; mark, including uploaded images.</p>
          </SaveForm>
        ))}

        <SaveForm action={saveProduct} label="Add product" className="bg-amber/20 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold">Add a product</h3>
          <input type="hidden" name="id" value="" />
          <input type="hidden" name="active" value="on" />
          <label className="block font-medium">Name<input name="name" required className={input} /></label>
          <label className="block font-medium">Description<textarea name="description" rows={2} className={`${input} py-2`} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block font-medium">Price (USD)<input name="price" type="number" step="0.01" min="0.01" required className={input} /></label>
            <Cat />
          </div>
          <ImageField name="image" label="Product image (optional)" defaultValue="" />
        </SaveForm>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold">Footer</h2>
        <SaveForm action={saveContent} className="bg-white rounded-2xl p-5 space-y-3">
          {FIELDS.map((f) => <label key={f.key} className="block font-medium">{f.label}<textarea name={f.key} rows={3} defaultValue={content[f.key]} className={`${input} py-2`} /></label>)}
        </SaveForm>
      </section>
    </div>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listPages } from "@/lib/pages";
import type { Page } from "@/lib/blocks";
import { ConfirmButton, SaveForm } from "@/components/admin-forms";
import { Head, btnPrimary, card, input } from "@/components/admin-ui";
import { createPage, removePage } from "../../actions";

const GROUPS: { origin: NonNullable<Page["origin"]>; title: string; note: string }[] = [
  { origin: "builtin", title: "Main pages", note: "Home and information pages." },
  { origin: "category", title: "Category pages", note: "One per category, created automatically. Add or remove them under Categories." },
  { origin: "custom", title: "Custom pages", note: "Pages you created." },
];

export default async function PagesHub() {
  await requireAdmin();
  const pages = await listPages();

  return (
    <>
      <Head title="Pages" sub="Open any page to edit it with the block builder: add, reorder and change text, images and buttons, with a live preview." />

      {GROUPS.map((g) => {
        const list = pages.filter((p) => p.origin === g.origin);
        if (g.origin === "custom" && list.length === 0) return null;
        return (
          <section key={g.origin} className="mb-8">
            <h2 className="font-display text-xl font-bold">{g.title}</h2>
            <p className="text-sm text-black/60 mb-3">{g.note}</p>
            <ul className="space-y-2">
              {list.map((p) => (
                <li key={p.slug} className={`${card} !p-3 flex flex-wrap sm:flex-nowrap items-center gap-2`}>
                  <div className="min-w-0 flex-1 basis-full sm:basis-0">
                    <p className="font-bold truncate">{p.title}</p>
                    <p className="text-xs text-black/60">/{p.slug === "home" ? "" : p.slug} · {p.published ? "live" : "draft"}{p.nav ? " · in menu" : ""}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center">
                  <Link href={`/admin/pages/${p.slug}`} className={btnPrimary}>Edit</Link>
                  <Link href={p.slug === "home" ? "/" : `/${p.slug}`} target="_blank" className="min-h-11 px-3 grid place-items-center underline">View</Link>
                  <form action={removePage}>
                    <input type="hidden" name="slug" value={p.slug} />
                    <ConfirmButton className="min-h-11 px-3 underline text-red-700" label={p.origin === "custom" ? "Delete" : "Reset"}
                      message={p.origin === "custom" ? "Delete this page permanently?" : "Discard your edits and restore the original version of this page?"} />
                  </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <SaveForm action={createPage} label="Create page" className="bg-amber/20 rounded-2xl p-5 space-y-2">
        <h2 className="font-display text-xl font-bold">New page</h2>
        <label className="block font-medium">Page title<input name="title" required maxLength={80} className={input} placeholder="e.g. Careers" /></label>
        <p className="text-xs text-black/60">New pages start as a draft. Publish them from the page editor.</p>
      </SaveForm>
    </>
  );
}

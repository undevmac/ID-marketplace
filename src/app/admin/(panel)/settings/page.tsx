import { requireAdmin } from "@/lib/auth";
import { FIELDS, getContent } from "@/lib/content";
import { SaveForm } from "@/components/admin-forms";
import { Head, input } from "@/components/admin-ui";
import { saveContent } from "../../actions";

export default async function Settings() {
  await requireAdmin();
  const content = await getContent();
  return (
    <>
      <Head title="Settings" sub="Site-wide text that isn't part of any single page." />
      <SaveForm action={saveContent} className="bg-white rounded-2xl p-5 space-y-3 max-w-2xl shadow-sm">
        <h2 className="font-display text-xl font-bold">Footer</h2>
        {FIELDS.map((f) => <label key={f.key} className="block font-medium">{f.label}<textarea name={f.key} rows={3} defaultValue={content[f.key]} className={`${input} py-2`} /></label>)}
        <p className="text-xs text-black/60">The prop-card disclaimer above this text is fixed and can&rsquo;t be edited.</p>
      </SaveForm>
    </>
  );
}

import { requireAdmin } from "@/lib/auth";
import { FIELDS, getContent } from "@/lib/content";
import { SaveForm } from "@/components/admin-forms";
import { Head, input } from "@/components/admin-ui";
import { saveContent } from "../../actions";

const HINTS: Record<string, string> = {
  "Website name": "Shown in the header, footer, browser tab and this admin. Up to 40 characters. A name like “Acme Cards” or “AcmeCards” gets a two-tone logo.",
  Footer: "The prop-card disclaimer above this text is fixed and can’t be edited.",
};

export default async function Settings() {
  await requireAdmin();
  const content = await getContent();
  const groups = [...new Set(FIELDS.map((f) => f.group))];
  return (
    <>
      <Head title="Settings" sub="Site-wide settings that aren't part of any single page." />
      <div className="max-w-2xl space-y-5">
        {groups.map((g) => (
          <SaveForm key={g} action={saveContent} className="bg-white rounded-2xl p-5 space-y-3 shadow-sm">
            <h2 className="font-display text-xl font-bold">{g}</h2>
            {FIELDS.filter((f) => f.group === g).map((f) => f.kind === "long"
              ? <label key={f.key} className="block font-medium">{f.label}<textarea name={f.key} rows={3} defaultValue={content[f.key]} className={`${input} py-2`} /></label>
              : <label key={f.key} className="block font-medium">{f.label}<input name={f.key} required maxLength={40} defaultValue={content[f.key]} className={input} /></label>)}
            {HINTS[g] && <p className="text-xs text-black/60">{HINTS[g]}</p>}
          </SaveForm>
        ))}
      </div>
    </>
  );
}

import { requireAdmin } from "@/lib/auth";
import { FIELDS, getContent, getSecrets } from "@/lib/content";
import { SaveForm } from "@/components/admin-forms";
import { Head, input } from "@/components/admin-ui";
import { changeEmail, changePassword, saveContent, sendTestEmail } from "../../actions";

const HINTS: Record<string, string> = {
  "Website name": "Shown in the header, footer, browser tab and this admin. Up to 40 characters. A name like “Acme Cards” or “AcmeCards” gets a two-tone logo.",
  "Email notifications": "Order alerts and contact-form messages go here. Use any address, Gmail or otherwise; separate up to 5 with commas. Save first, then send a test.",
  WhatsApp: "Adds a WhatsApp chat button to every page, an Order on WhatsApp button on category pages and a Checkout on WhatsApp button in the cart. Leave empty to turn it off.",
  "Discord notifications": "In Discord: channel settings, Integrations, Webhooks, New Webhook, Copy URL. New orders and contact messages are posted there. Leave empty to turn it off.",
  Footer: "The prop-card disclaimer above this text is fixed and can’t be edited.",
};

export default async function Settings() {
  const [pub, secrets, me] = [await getContent(), await getSecrets(), await requireAdmin()];
  const content = { ...pub, ...secrets };
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
              : <label key={f.key} className="block font-medium">{f.label}<input name={f.key} required={f.key === "site_name"} maxLength={f.key === "site_name" ? 40 : 200} defaultValue={content[f.key]} className={input} /></label>)}
            {HINTS[g] && <p className="text-xs text-black/60">{HINTS[g]}</p>}
          </SaveForm>
        ))}
        <SaveForm action={changeEmail} label="Change email" className="bg-white rounded-2xl p-5 space-y-3 shadow-sm">
          <h2 className="font-display text-xl font-bold">Admin login email</h2>
          <p className="text-xs text-black/60">Currently {me.email}. You will be signed out and must log in with the new email.</p>
          <label className="block font-medium">New email<input name="email" type="email" required className={input} /></label>
          <label className="block font-medium">Current password<input name="current" type="password" required autoComplete="current-password" className={input} /></label>
        </SaveForm>
        <SaveForm action={changePassword} label="Change password" className="bg-white rounded-2xl p-5 space-y-3 shadow-sm">
          <h2 className="font-display text-xl font-bold">Admin password</h2>
          <label className="block font-medium">Current password<input name="current" type="password" required autoComplete="current-password" className={input} /></label>
          <label className="block font-medium">New password (8+ characters)<input name="new" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
          <label className="block font-medium">Repeat new password<input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
        </SaveForm>
        <SaveForm action={sendTestEmail} label="Send test email" className="bg-white rounded-2xl p-5 space-y-3 shadow-sm">
          <h2 className="font-display text-xl font-bold">Test email</h2>
          <p className="text-xs text-black/60">Sends a test message to the address(es) saved above. Until a sending domain is verified in Resend, only the Resend account owner&apos;s address receives mail.</p>
        </SaveForm>
      </div>
    </>
  );
}

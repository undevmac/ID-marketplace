import { requireAdmin } from "@/lib/auth";
import { FIELDS, getContent, getSecrets, type Field } from "@/lib/content";
import { SaveForm } from "@/components/admin-forms";
import PhoneField from "@/components/phone-field";
import { Head, input } from "@/components/admin-ui";
import { changeEmail, changePassword, saveContent, sendTestDiscord, sendTestEmail } from "../../actions";

const HINTS: Record<string, string> = {
  "Website name": "Shown in the header, footer, browser tab and this admin. Up to 40 characters. A name like “Acme Cards” or “AcmeCards” gets a two-tone logo.",
  "Email notifications": "Order alerts and contact-form messages go to the address(es) above. Use any address, Gmail or otherwise; separate up to 5 with commas.",
  WhatsApp: "Pick the country, then type the number. A +, spaces, a leading 0 or a repeated country code are removed for you. Leave the number empty to turn WhatsApp off.",
  "Discord notifications": "In Discord: channel settings, Integrations, Webhooks, New Webhook, Copy URL.",
  Footer: "The prop-card disclaimer above this text is fixed and can’t be edited.",
};

// Switch: the checkbox comes first, the hidden "0" second, so a checked switch submits "1" first and an unchecked one submits "0".
function Toggle({ f, on }: { f: Field; on: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 min-h-11 font-medium cursor-pointer">
      <span>{f.label}</span>
      <span className="relative shrink-0">
        <input type="checkbox" name={f.key} value="1" defaultChecked={on} className="peer sr-only" />
        <input type="hidden" name={f.key} value="0" />
        <span aria-hidden className="block w-12 h-7 rounded-full bg-black/25 peer-checked:bg-green-600 peer-focus-visible:ring-2 ring-navy transition-colors" />
        <span aria-hidden className="absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

const card = "bg-white rounded-2xl p-5 space-y-3 shadow-sm";

export default async function Settings() {
  const [pub, secrets, me] = [await getContent(), await getSecrets(), await requireAdmin()];
  const content = { ...pub, ...secrets };
  const groups = [...new Set(FIELDS.map((f) => f.group))];
  const cc = content.whatsapp_cc, full = content.whatsapp_number;
  const national = cc && full.startsWith(cc) ? full.slice(cc.length) : full;
  const test: Record<string, React.ReactNode> = {
    "Email notifications": (
      <SaveForm action={sendTestEmail} label="Send test email" className={card}>
        <h3 className="font-display text-lg font-bold">Test email</h3>
        <p className="text-xs text-black/60">Sends a test message to the address(es) saved above. Save your changes first. Until a sending domain is verified in Resend, only the Resend account owner&apos;s address receives mail.</p>
      </SaveForm>
    ),
    "Discord notifications": (
      <SaveForm action={sendTestDiscord} label="Send test to Discord" className={card}>
        <h3 className="font-display text-lg font-bold">Test Discord</h3>
        <p className="text-xs text-black/60">Posts a test message to the saved webhook. Save your changes first.</p>
      </SaveForm>
    ),
    WhatsApp: full ? (
      <div className={card}>
        <h3 className="font-display text-lg font-bold">Test WhatsApp</h3>
        <p className="text-xs text-black/60">Opens a chat with +{full} the way customers will see it.</p>
        <a href={`https://wa.me/${full}?text=${encodeURIComponent("Test message from my store")}`} target="_blank" rel="noopener noreferrer" className="inline-grid place-items-center min-h-11 px-6 rounded-full bg-[#25D366] text-white font-bold">Open test chat</a>
      </div>
    ) : null,
  };
  return (
    <>
      <Head title="Settings" sub="Site-wide settings that aren't part of any single page." />
      <div className="max-w-2xl space-y-5">
        {groups.map((g) => (
          <div key={g} className="space-y-3">
            <SaveForm action={saveContent} className={card}>
              <h2 className="font-display text-xl font-bold">{g}</h2>
              {g === "WhatsApp" && <PhoneField cc={cc} national={national} />}
              {FIELDS.filter((f) => f.group === g && f.label).map((f) => f.kind === "toggle"
                ? <Toggle key={f.key} f={f} on={content[f.key] !== "0"} />
                : f.kind === "long"
                  ? <label key={f.key} className="block font-medium">{f.label}<textarea name={f.key} rows={3} defaultValue={content[f.key]} className={`${input} py-2`} /></label>
                  : <label key={f.key} className="block font-medium">{f.label}<input name={f.key} required={f.key === "site_name"} maxLength={f.key === "site_name" ? 40 : 200} defaultValue={content[f.key]} className={input} /></label>)}
              {HINTS[g] && <p className="text-xs text-black/60">{HINTS[g]}</p>}
            </SaveForm>
            {test[g]}
          </div>
        ))}
        <SaveForm action={changeEmail} label="Change email" className={card}>
          <h2 className="font-display text-xl font-bold">Admin login email</h2>
          <p className="text-xs text-black/60">Currently {me.email}. You will be signed out and must log in with the new email.</p>
          <label className="block font-medium">New email<input name="email" type="email" required className={input} /></label>
          <label className="block font-medium">Current password<input name="current" type="password" required autoComplete="current-password" className={input} /></label>
        </SaveForm>
        <SaveForm action={changePassword} label="Change password" className={card}>
          <h2 className="font-display text-xl font-bold">Admin password</h2>
          <label className="block font-medium">Current password<input name="current" type="password" required autoComplete="current-password" className={input} /></label>
          <label className="block font-medium">New password (8+ characters)<input name="new" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
          <label className="block font-medium">Repeat new password<input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
        </SaveForm>
      </div>
    </>
  );
}

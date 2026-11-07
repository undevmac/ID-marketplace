"use client";
import { useActionState, useState, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { signUpload } from "@/app/admin/actions";

type State = { msg?: string; error?: string } | undefined;

// Form wrapper that shows "Saved ✓" / errors from a server action.
export function SaveForm({ action, children, label = "Save changes", className = "" }: { action: (s: State, fd: FormData) => Promise<State>; children: ReactNode; label?: string; className?: string }) {
  const [state, run, pending] = useActionState(action, undefined);
  return (
    <form action={run} className={className}>
      {children}
      <div className="flex items-center gap-3 pt-2">
        <button disabled={pending} className="min-h-11 px-6 rounded-full bg-navy text-white font-bold disabled:opacity-60">{pending ? "Saving…" : label}</button>
        {state?.msg && <span role="status" className="text-green-700 font-bold">{state.msg}</span>}
        {state?.error && <span role="alert" className="text-red-700 font-bold">{state.error}</span>}
      </div>
    </form>
  );
}

// Controlled uploader: pick a file -> upload to Storage -> onChange(publicUrl).
export function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(f?: File) {
    if (!f) return;
    setErr("");
    if (f.size > 5 * 1024 * 1024) return setErr("Max 5 MB.");
    setBusy(true);
    const r = await signUpload(f.name);
    if ("error" in r) { setBusy(false); return setErr(r.error); }
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { error } = await sb.storage.from("site").uploadToSignedUrl(r.path, r.token, f);
    setBusy(false);
    if (error) return setErr("Upload failed.");
    onChange(r.url);
  }

  return (
    <div className="space-y-2">
      <span className="block font-medium">{label}</span>
      {value ? <img src={value} alt="" className="h-28 rounded-lg object-cover border" /> : <div className="h-28 w-48 rounded-lg border border-dashed grid place-items-center text-sm text-black/50">No image</div>}
      <div className="flex gap-2 items-center flex-wrap">
        <label className="min-h-11 px-4 grid place-items-center rounded-full bg-amber font-bold cursor-pointer">
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {value && <button type="button" onClick={() => onChange("")} className="min-h-11 px-3 underline">Remove</button>}
        {err && <span role="alert" className="text-red-700">{err}</span>}
      </div>
    </div>
  );
}

// Same, for plain <form> posts: keeps the URL in a hidden input.
export function ImageField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue);
  return <><input type="hidden" name={name} value={url} /><ImageInput value={url} onChange={setUrl} label={label} /></>;
}

// Submit button that asks first (for destructive actions).
export function ConfirmButton({ label, message, className = "" }: { label: string; message: string; className?: string }) {
  return <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{label}</button>;
}

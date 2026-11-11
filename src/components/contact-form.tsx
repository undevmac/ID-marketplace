"use client";
import { useActionState } from "react";
import { sendContact } from "@/app/actions";

const field = "w-full min-h-11 rounded-lg border border-black/20 px-3 bg-white";

export default function ContactForm({ heading, body }: { heading: string; body: string }) {
  const [state, action, pending] = useActionState(sendContact, undefined);
  return (
    <section className="max-w-6xl mx-auto px-4 pt-12">
      <div className="max-w-xl mx-auto space-y-3">
        {heading && <h2 className="font-display text-3xl font-bold">{heading}</h2>}
        {body && <p className="text-lg whitespace-pre-line">{body}</p>}
        <form action={action} className="bg-white rounded-xl p-4 space-y-3">
          <label className="block">Your name<input name="name" required maxLength={100} autoComplete="name" className={field} /></label>
          <label className="block">Email<input name="email" type="email" required maxLength={200} autoComplete="email" className={field} /></label>
          <label className="block">Message<textarea name="message" required rows={5} maxLength={4000} className={`${field} py-2`} /></label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {state?.error && <p role="alert" className="text-red-700 font-bold">{state.error}</p>}
          {state?.msg && <p role="status" className="text-green-700 font-bold">{state.msg}</p>}
          <button type="submit" disabled={pending} className="w-full min-h-12 rounded-full bg-navy text-white font-bold disabled:opacity-60">{pending ? "Sending…" : "Send message"}</button>
        </form>
      </div>
    </section>
  );
}

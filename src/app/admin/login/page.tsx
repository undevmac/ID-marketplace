"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState(login, undefined);
  const f = "w-full min-h-11 rounded-lg border border-black/20 px-3 bg-white";
  return (
    <form action={action} className="max-w-sm mx-auto px-4 py-16 space-y-3">
      <meta name="robots" content="noindex" />
      <h1 className="font-display text-3xl font-bold">Admin login</h1>
      <label className="block">Email<input name="email" type="email" required autoComplete="username" className={f} /></label>
      <label className="block">Password<input name="password" type="password" required autoComplete="current-password" className={f} /></label>
      {state?.error && <p role="alert" className="text-red-700 font-bold">{state.error}</p>}
      <button disabled={pending} className="w-full min-h-12 rounded-full bg-navy text-white font-bold disabled:opacity-60">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

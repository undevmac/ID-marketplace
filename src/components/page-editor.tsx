"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { BLOCKS, type Block, type Data, type F, type Item } from "@/lib/blocks";
import { ImageInput } from "./admin-forms";
import { savePage } from "@/app/admin/actions";

const input = "w-full min-h-11 rounded-lg border border-black/20 px-3 bg-white font-normal";
const btn = "min-h-9 min-w-9 px-2 rounded border border-black/20 bg-white text-sm disabled:opacity-30";
type V = string | Item[];

const blank = (f: F): Item => Object.fromEntries((f.item ?? []).map((x) => [x.key, ""]));
const move = <T,>(a: T[], i: number, d: number) => { const j = i + d; if (j < 0 || j >= a.length) return a; const c = [...a]; [c[i], c[j]] = [c[j], c[i]]; return c; };

type Cats = [slug: string, label: string][];

function Field({ f, value, onChange, cats }: { f: F; value: V; onChange: (v: V) => void; cats: Cats }) {
  const str = typeof value === "string" ? value : "";
  if (f.kind === "image") return <ImageInput label={f.label} value={str} onChange={onChange} />;
  if (f.kind === "check") return <label className="flex items-center gap-2 min-h-11 font-medium"><input type="checkbox" className="size-5" checked={!!str} onChange={(e) => onChange(e.target.checked ? "1" : "")} />{f.label}</label>;
  if (f.kind === "category") return <label className="block font-medium">{f.label}<select className={input} value={str} onChange={(e) => onChange(e.target.value)}><option value="all">All products</option>{cats.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>;
  if (f.kind === "select") return <label className="block font-medium">{f.label}<select className={input} value={str} onChange={(e) => onChange(e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select></label>;
  if (f.kind === "long") return <label className="block font-medium">{f.label}<textarea rows={3} className={`${input} py-2`} value={str} onChange={(e) => onChange(e.target.value)} /></label>;
  if (f.kind === "list") {
    const items = Array.isArray(value) ? value : [];
    const set = (n: Item[]) => onChange(n);
    return (
      <div className="space-y-2">
        <span className="block font-medium">{f.label}</span>
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-black/15 bg-black/[.03] p-3 space-y-3">
            <div className="flex gap-1 justify-end">
              <button type="button" className={btn} aria-label="Move up" disabled={i === 0} onClick={() => set(move(items, i, -1))}>↑</button>
              <button type="button" className={btn} aria-label="Move down" disabled={i === items.length - 1} onClick={() => set(move(items, i, 1))}>↓</button>
              <button type="button" className={btn} aria-label="Remove item" onClick={() => set(items.filter((_, j) => j !== i))}>✕</button>
            </div>
            {f.item!.map((sf) => <Field key={sf.key} f={sf} cats={cats} value={it[sf.key] ?? ""} onChange={(v) => set(items.map((x, j) => (j === i ? { ...x, [sf.key]: v as string } : x)))} />)}
          </div>
        ))}
        <button type="button" className="min-h-11 px-4 rounded-full border border-black/30 font-bold" onClick={() => set([...items, blank(f)])}>+ Add item</button>
      </div>
    );
  }
  return <label className="block font-medium">{f.label}<input className={input} value={str} placeholder={f.kind === "link" ? "/page, https://… or mailto:…" : ""} onChange={(e) => onChange(e.target.value)} /></label>;
}

export default function PageEditor({ initial, cats }: { initial: { slug: string; title: string; nav: boolean; published: boolean; blocks: Block[] }; cats: Cats }) {
  const [title, setTitle] = useState(initial.title);
  const [nav, setNav] = useState(initial.nav);
  const [published, setPublished] = useState(initial.published);
  const [blocks, setBlocks] = useState<Block[]>(initial.blocks);
  const [add, setAdd] = useState("text");
  const [msg, setMsg] = useState<{ ok: boolean; t: string }>();
  const [pending, start] = useTransition();
  const [ver, setVer] = useState(0); // bump to reload the preview
  const home = initial.slug === "home";
  const url = home ? "/" : `/${initial.slug}`;

  const setData = (i: number, k: string, v: V) => setBlocks((b) => b.map((x, j) => (j === i ? { ...x, data: { ...x.data, [k]: v } as Data } : x)));
  const save = () => start(async () => {
    const r = await savePage({ slug: initial.slug, title, nav, published, blocks });
    setMsg(r?.error ? { ok: false, t: r.error } : { ok: true, t: published || home ? "Saved ✓ (live now)" : "Saved ✓ (draft, not visible yet)" });
    if (!r?.error) setVer((v) => v + 1);
  });

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
      <div className="space-y-4 pb-24">
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <label className="block font-medium">Page title<input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <p className="text-sm text-black/60">Address: <code>{url}</code></p>
          {!home && <>
            <label className="flex items-center gap-2 min-h-11"><input type="checkbox" className="size-5" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published (visible to visitors)</label>
            <label className="flex items-center gap-2 min-h-11"><input type="checkbox" className="size-5" checked={nav} onChange={(e) => setNav(e.target.checked)} /> Show in the menu</label>
          </>}
        </div>

        {blocks.map((b, i) => (
          <details key={b.id} open={blocks.length === 1} className="bg-white rounded-2xl p-4">
            <summary className="flex items-center justify-between gap-2 cursor-pointer list-none min-h-11">
              <span className="font-bold">{i + 1}. {BLOCKS[b.type].label}</span>
              <span className="flex gap-1" onClick={(e) => e.preventDefault()}>
                <button type="button" className={btn} aria-label="Move up" disabled={i === 0} onClick={() => setBlocks(move(blocks, i, -1))}>↑</button>
                <button type="button" className={btn} aria-label="Move down" disabled={i === blocks.length - 1} onClick={() => setBlocks(move(blocks, i, 1))}>↓</button>
                <button type="button" className={btn} aria-label="Duplicate" onClick={() => setBlocks([...blocks.slice(0, i + 1), { ...structuredClone(b), id: crypto.randomUUID().slice(0, 8) }, ...blocks.slice(i + 1)])}>⧉</button>
                <button type="button" className={btn} aria-label="Delete block" onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}>🗑</button>
              </span>
            </summary>
            <div className="space-y-4 pt-4">
              {BLOCKS[b.type].fields.map((f) => <Field key={f.key} f={f} cats={cats} value={b.data[f.key] ?? ""} onChange={(v) => setData(i, f.key, v)} />)}
            </div>
          </details>
        ))}

        <div className="bg-amber/20 rounded-2xl p-4 flex gap-2 flex-wrap items-center">
          <select aria-label="Block type" className={`${input} w-auto`} value={add} onChange={(e) => setAdd(e.target.value)}>
            {Object.entries(BLOCKS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button type="button" className="min-h-11 px-5 rounded-full bg-amber font-bold" onClick={() => setBlocks([...blocks, { id: crypto.randomUUID().slice(0, 8), type: add, data: structuredClone(BLOCKS[add].def) }])}>+ Add block</button>
        </div>

        <div className="fixed bottom-0 inset-x-0 lg:static bg-white/95 lg:bg-transparent p-3 lg:p-0 shadow-[0_-4px_12px_#0001] lg:shadow-none flex items-center gap-3 flex-wrap z-40">
          <button onClick={save} disabled={pending} className="min-h-12 px-8 rounded-full bg-navy text-white font-bold disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
          <Link href="/admin/pages" className="underline min-h-11 grid place-items-center">Back to pages</Link>
          {msg && <span role="status" className={msg.ok ? "text-green-700 font-bold" : "text-red-700 font-bold"}>{msg.t}</span>}
        </div>
      </div>

      <aside className="hidden lg:block sticky top-4">
        <div className="flex items-center justify-between mb-2"><span className="font-bold">Live preview</span><a href={url} target="_blank" className="underline text-sm">Open page ↗</a></div>
        <iframe key={ver} src={url} title="Page preview" className="w-full h-[78vh] rounded-2xl border bg-white" />
        <p className="text-xs text-black/60 mt-1">Shows the saved version. Press Save to update it.</p>
      </aside>
    </div>
  );
}

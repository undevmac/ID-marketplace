// Pure data (no JSX, no server APIs) so the editor (client), renderer (server) and validator share it.
export type Item = Record<string, string>;
export type Data = Record<string, string | Item[]>;
export type Block = { id: string; type: string; data: Data };
export type Page = { slug: string; title: string; nav: boolean; published: boolean; blocks: Block[]; origin?: "builtin" | "category" | "custom" };
export type F = { key: string; label: string; kind: "text" | "long" | "image" | "link" | "select" | "check" | "list" | "category"; options?: string[]; item?: F[] };

export const RESERVED = ["admin", "cart", "order", "products", "api", "login", "_next"];

const t = (key: string, label: string): F => ({ key, label, kind: "text" });
const l = (key: string, label: string): F => ({ key, label, kind: "long" });
const img = (key: string, label: string): F => ({ key, label, kind: "image" });
const link = (key: string, label: string): F => ({ key, label, kind: "link" });

export const BLOCKS: Record<string, { label: string; fields: F[]; def: Data }> = {
  hero: {
    label: "Hero slideshow",
    fields: [{ key: "slides", label: "Slides (3–5 works best)", kind: "list", item: [t("title", "Headline"), l("sub", "Sub-text"), t("cta", "Button text"), link("href", "Button link"), img("image", "Background image (optional)")] }],
    def: { slides: [{ title: "Your headline", sub: "A short supporting line.", cta: "Shop now", href: "/", image: "" }] },
  },
  ticker: { label: "Scrolling banner", fields: [l("items", "Messages (one per line)")], def: { items: "Free proofs before print\nShips in 3–5 working days" } },
  categories: {
    label: "Category tiles",
    fields: [
      t("title", "Title"),
      { key: "auto", label: "Fill automatically from my categories", kind: "check" },
      { key: "tiles", label: "Custom tiles (used only when automatic is off)", kind: "list", item: [t("title", "Name"), l("blurb", "Short text"), link("href", "Link"), img("image", "Image (optional)")] },
    ],
    def: { title: "Shop by category", auto: "1", tiles: [] },
  },
  products: {
    label: "Product grid",
    fields: [t("title", "Title"), { key: "category", label: "Show products from", kind: "category" }],
    def: { title: "Products", category: "all" },
  },
  text: {
    label: "Heading + text",
    fields: [t("heading", "Heading"), l("body", "Text"), { key: "align", label: "Alignment", kind: "select", options: ["left", "center"] }],
    def: { heading: "Heading", body: "Write something here.", align: "left" },
  },
  image_text: {
    label: "Image + text",
    fields: [img("image", "Image"), t("heading", "Heading"), l("body", "Text"), t("cta", "Button text (optional)"), link("href", "Button link"), { key: "side", label: "Image side", kind: "select", options: ["left", "right"] }],
    def: { image: "", heading: "Heading", body: "Write something here.", cta: "", href: "", side: "left" },
  },
  banner: {
    label: "Parallax banner",
    fields: [img("image", "Background image (optional)"), t("heading", "Heading"), l("sub", "Sub-text"), t("cta", "Button text (optional)"), link("href", "Button link"), { key: "size", label: "Height", kind: "select", options: ["tall", "short"] }, { key: "wave", label: "Wavy bottom edge", kind: "check" }],
    def: { image: "", heading: "Heading", sub: "", cta: "", href: "", size: "short", wave: "1" },
  },
  faq: {
    label: "FAQ",
    fields: [t("title", "Title"), { key: "items", label: "Questions", kind: "list", item: [t("q", "Question"), l("a", "Answer")] }],
    def: { title: "Frequently asked questions", items: [{ q: "Question?", a: "Answer." }] },
  },
  cta: {
    label: "Call to action",
    fields: [t("heading", "Heading"), l("body", "Text"), t("cta", "Button text"), link("href", "Button link"), { key: "wave", label: "Wavy bottom edge", kind: "check" }],
    def: { heading: "Ready to order?", body: "", cta: "Start an order", href: "/cart", wave: "" },
  },
};

// Only same-site paths, https and mailto are allowed as links (blocks javascript: etc).
export const safeHref = (v: string) => (/^(\/(?!\/)|https:\/\/|mailto:)/.test(v) ? v : "");

const clean = (f: F, v: unknown): string | Item[] => {
  if (f.kind === "list") {
    return (Array.isArray(v) ? v : []).slice(0, 30).map((it) => Object.fromEntries((f.item ?? []).map((sf) => [sf.key, clean(sf, (it as Item)?.[sf.key]) as string])));
  }
  const s = typeof v === "string" ? v.trim().slice(0, 3000) : "";
  if (f.kind === "image") return /^https:\/\//.test(s) ? s : "";
  if (f.kind === "link") return safeHref(s);
  if (f.kind === "select") return f.options!.includes(s) ? s : f.options![0];
  if (f.kind === "check") return s ? "1" : "";
  if (f.kind === "category") return /^(all|[a-z0-9-]{1,40})$/.test(s) ? s : "all";
  return s;
};

// Server-side validation of whatever the editor sends. Unknown block types/fields are dropped.
export function sanitizeBlocks(input: unknown): Block[] {
  return (Array.isArray(input) ? input : []).slice(0, 40).flatMap((b, i) => {
    const def = BLOCKS[(b as Block)?.type];
    if (!def) return [];
    const data = (b as Block).data ?? {};
    return [{ id: String((b as Block).id ?? i).replace(/[^\w-]/g, "").slice(0, 20) || String(i), type: (b as Block).type, data: Object.fromEntries(def.fields.map((f) => [f.key, clean(f, data[f.key])])) }];
  });
}

// ---------- Default pages (used until a page is edited and saved; DB rows override) ----------
let n = 0;
const b = (type: string, data: Data): Block => ({ id: `${type}-${++n}`, type, data: { ...structuredClone(BLOCKS[type].def), ...data } });

// Starter copy for the original five categories; any new category gets the generic version.
const CATEGORY_FAQ: Record<string, Item[]> = {
  "staff-badges": [{ q: "Can I add a photo?", a: "Yes. Send photos with your order notes and we place them on the proof." }, { q: "Is there a minimum order?", a: "No. Order a single card or thousands." }],
  "student-ids": [{ q: "Can you add barcodes?", a: "Yes, barcode, QR or magnetic stripe." }],
  "visitor-passes": [{ q: "How many are in a pack?", a: "Packs are 50 passes; larger quantities on request." }],
  "event-badges": [{ q: "What is the minimum?", a: "25 badges." }],
  "prop-cards": [
    { q: "Are prop cards real IDs?", a: "No. They are novelty items from fictional organisations and carry a permanent PROP – NOT A GOVERNMENT ID mark." },
    { q: "Can I order a card that copies a real document?", a: "No. We do not produce replicas of government-issued documents." },
  ],
};

// Every category automatically gets this page at /<slug>. Editing it saves a copy that overrides this.
export const categoryPage = (c: { slug: string; label: string; description: string }): Page => ({
  slug: c.slug, title: c.label, nav: true, published: true,
  blocks: [
    b("banner", { heading: c.label, sub: c.description, size: "short", wave: "1" }),
    b("products", { title: `All ${c.label.toLowerCase()}`, category: c.slug }),
    b("faq", { title: "Good to know", items: CATEGORY_FAQ[c.slug] ?? [{ q: "Can I order a custom quantity?", a: "Yes. Add the quantity in your order notes and we'll confirm the price." }] }),
    b("cta", { heading: "Need a custom quantity or design?", body: "Tell us what you need in your order notes and we'll send a free proof.", cta: "Start an order", href: "/cart" }),
  ],
});

export const DEFAULT_PAGES: Page[] = [
  {
    slug: "home", title: "Home", nav: false, published: true,
    blocks: [
      b("hero", { slides: [
        { title: "Badges your team will actually wear", sub: "Staff ID cards printed on durable PVC, from 1 card.", cta: "Shop badges", href: "/staff-badges", image: "" },
        { title: "Student IDs, ready for the term", sub: "Photo cards with student numbers, barcodes or QR.", cta: "Student IDs", href: "/student-ids", image: "" },
        { title: "Props for film, games & cosplay", sub: "Fictional issuers. Always marked PROP – NOT A GOVERNMENT ID.", cta: "See props", href: "/prop-cards", image: "" },
      ] }),
      b("ticker", { items: "Free proofs before print\nBulk discounts from 50 cards\nShips in 3–5 working days\nStaff badges\nStudent IDs\nVisitor passes\nProp cards (clearly marked)" }),
      b("categories", { title: "Shop by category", auto: "1" }),
      b("products", { title: "Popular right now", category: "all" }),
      b("banner", { heading: "Proof first, print second", sub: "Every order gets a free digital proof before we print a single card.", cta: "How it works", href: "/how-it-works", size: "tall", wave: "1" }),
      b("cta", { heading: "Equip your whole team", body: "Order one card or a thousand.", cta: "Start an order", href: "/cart" }),
    ],
  },
  {
    slug: "about", title: "About", nav: true, published: true,
    blocks: [
      b("banner", { heading: "About BadgeWorks", sub: "ID cards and badges for organizations, made simple.", size: "short", wave: "1" }),
      b("text", { heading: "What we do", body: "We print staff badges, student ID cards, visitor passes and event badges for organizations of any size. We also make clearly-marked prop cards for film, games and cosplay.\n\nWe never produce government-issued identity documents or replicas of them." }),
      b("cta", { heading: "Let's make your cards", body: "", cta: "Start an order", href: "/cart" }),
    ],
  },
  {
    slug: "how-it-works", title: "How it works", nav: true, published: true,
    blocks: [
      b("banner", { heading: "How it works", sub: "From order to delivery in four steps.", size: "short", wave: "1" }),
      b("faq", { title: "The process", items: [
        { q: "1. Place an order request", a: "Choose your cards and tell us about your organization." },
        { q: "2. Approve your free proof", a: "We email a digital proof. Nothing is printed until you approve it." },
        { q: "3. We print", a: "Cards are printed on durable PVC." },
        { q: "4. Delivery", a: "Typically 3–5 working days after proof approval." },
      ] }),
      b("cta", { heading: "Ready when you are", body: "", cta: "Start an order", href: "/cart" }),
    ],
  },
  {
    slug: "shipping", title: "Shipping", nav: true, published: true,
    blocks: [b("text", { heading: "Shipping & delivery", body: "Orders typically ship 3–5 working days after proof approval. We will email tracking details once your cards are on their way.\n\nEdit this page in the admin to add your shipping rates and regions." })],
  },
  {
    slug: "contact", title: "Contact", nav: true, published: true,
    blocks: [
      b("text", { heading: "Contact us", body: "Questions about an order or a custom design? Place an order request and add your questions in the notes. We reply by email.", align: "center" }),
      b("cta", { heading: "Start with an order request", body: "", cta: "Start an order", href: "/cart" }),
    ],
  },
];

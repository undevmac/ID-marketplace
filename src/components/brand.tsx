import { getSiteName, splitBrand } from "@/lib/brand";

// The site name as a two-tone logo. Async server component, so it can be dropped into client components as a prop.
export default async function Brand() {
  const [a, b] = splitBrand(await getSiteName());
  return <>{a}{b && <span className="text-amber">{b}</span>}</>;
}

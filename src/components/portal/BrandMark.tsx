// Logos de simple-icons, en el color oficial de cada marca.
const BRANDS: Record<string, [string, string]> = {
  visa: ["visa", "#1A1F71"],
  mastercard: ["mastercard", "#EB001B"],
  "american express": ["americanexpress", "#2E77BC"],
  amex: ["americanexpress", "#2E77BC"],
};

const find = (name: string | null) => (name && Object.hasOwn(BRANDS, name.toLowerCase()) ? BRANDS[name.toLowerCase()] : undefined);
export const hasBrand = (name: string | null) => !!find(name);

export default function BrandMark({ name, size = "h-4 w-4" }: { name: string | null; size?: string }) {
  const b = find(name);
  if (!b) return null;
  const url = `url(/marcas/${b[0]}.svg)`;
  return <span aria-hidden="true" className={`inline-block shrink-0 ${size}`} style={{ background: b[1], maskImage: url, WebkitMaskImage: url, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }} />;
}

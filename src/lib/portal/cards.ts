// Ventas con tarjeta por tipo, marca y banco (contrato: docs/portal/contratos.md §5)
// y recomendaciones del Inicio. Cálculo de presentación como función pura. Sin imports de next/*.
import { PortalApiError, portalRequest } from "./auth.ts";
import { formatClp, type Dashboard } from "./sales.ts";

type Part = { amount: number; count: number };
export type SalesCards = {
  from: string;
  to: string;
  by_type: (Part & { type: "credit" | "debit" | "prepaid" | null })[];
  by_brand: (Part & { brand: string | null })[];
  by_issuer: (Part & { issuer: string | null })[];
  issuer_pending: Part;
};

const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const part = (p: Part) => !!p && num(p.amount) && num(p.count);
const strOrNull = (v: unknown) => v === null || typeof v === "string";

export async function getSalesCards(jwt: string, from: string, to: string): Promise<SalesCards> {
  const d = await portalRequest<SalesCards>(`/api/portal/v1/sales/cards?${new URLSearchParams({ from, to })}`, {
    headers: { "x-token-dtex": jwt },
  });
  const ok =
    Array.isArray(d.by_type) &&
    d.by_type.every((x) => part(x) && (x.type === null || ["credit", "debit", "prepaid"].includes(x.type))) &&
    Array.isArray(d.by_brand) &&
    d.by_brand.every((x) => part(x) && strOrNull(x.brand)) &&
    Array.isArray(d.by_issuer) &&
    d.by_issuer.every((x) => part(x) && strOrNull(x.issuer)) &&
    part(d.issuer_pending);
  if (!ok) throw new PortalApiError("NETWORK", 502);
  return d;
}

const TYPES = { credit: "Crédito", debit: "Débito", prepaid: "Prepago" };
// Una torta con más de 6 trozos no se lee: 5 bancos y el resto junto.
const TOP_ISSUERS = 5;

export type Slice = { key: string; label: string; amount: number; count: number; pct: number };

function slices(rows: { key: string; label: string; amount: number; count: number }[]): Slice[] {
  const total = rows.reduce((a, r) => a + Math.max(0, r.amount), 0);
  return rows
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((r) => ({ ...r, pct: total > 0 ? Math.round((100 * r.amount) / total) : 0 }));
}

export type CardsView = NonNullable<ReturnType<typeof buildCards>>;

export function buildCards(c: SalesCards) {
  const types = slices(c.by_type.map((t) => ({ key: t.type ?? "none", label: t.type ? TYPES[t.type] : "Sin dato", amount: t.amount, count: t.count })));
  if (types.length === 0) return null;

  const named = slices(c.by_issuer.filter((i) => i.issuer !== null).map((i) => ({ key: i.issuer!, label: i.issuer!, amount: i.amount, count: i.count })));
  const top = named.slice(0, TOP_ISSUERS);
  const rest = named.slice(TOP_ISSUERS);
  // "Otros bancos" va siempre al final, aunque sume más que alguno de los 5.
  const others = { key: "otros", label: "Otros bancos", amount: rest.reduce((a, r) => a + r.amount, 0), count: rest.reduce((a, r) => a + r.count, 0), pct: 0 };
  const issuers = rest.length ? slices([...top, others]).sort((a, b) => Number(a.key === "otros") - Number(b.key === "otros")) : top;
  const unknown = c.by_issuer.filter((i) => i.issuer === null).reduce((a, i) => a + i.amount, 0);

  return {
    types,
    brands: slices(c.by_brand.map((b) => ({ key: b.brand ?? "none", label: b.brand ?? "Otras", amount: b.amount, count: b.count }))),
    issuers,
    // Kushki informa el banco al día siguiente: lo de hoy y ayer queda pendiente, no "sin dato".
    pending: c.issuer_pending.amount > 0 ? `${formatClp(c.issuer_pending.amount)} aún sin banco informado (se completa al día siguiente).` : null,
    unknown: unknown > 0 ? `${formatClp(unknown)} pagados con equipos que no informan el banco.` : null,
  };
}

export type Tip = { key: string; text: string; basis: string };

/** Hasta 3 consejos con reglas fijas; cada uno dice de qué dato sale. */
export function buildTips(d: Dashboard, cards: CardsView | null): Tip[] {
  const tips: Tip[] = [];
  const bank = cards?.issuers.find((i) => i.key !== "otros");
  if (bank && bank.pct >= 25) {
    tips.push({
      key: "bank",
      text: `El ${bank.pct}% de lo que cobras con tarjeta viene de clientes de ${bank.label}. Una promoción con ese banco llega a muchos de ellos.`,
      basis: "Bancos de los últimos 7 días",
    });
  }
  // Hoy va a medias: no entra al promedio ni puede ser el día flojo.
  const past = d.days.filter((x) => !x.isToday);
  const avg = past.reduce((a, x) => a + x.current, 0) / (past.length || 1);
  const weak = past.reduce((a, x) => (x.current < a.current ? x : a), past[0]);
  if (weak && avg > 0 && weak.current <= avg * 0.8) {
    const less = Math.round(100 - (100 * weak.current) / avg);
    tips.push({
      key: "weak",
      text: `El ${weak.date} vendiste ${less}% menos que tu promedio diario. Una oferta para ese día de la semana puede atraer más clientes.`,
      basis: "Día por día, últimos 7 días",
    });
  }
  if (d.kpis.ticketDelta !== null && d.kpis.ticketDelta <= -10) {
    tips.push({
      key: "ticket",
      text: `Tu ticket promedio bajó ${Math.round(-d.kpis.ticketDelta)}% contra ${d.compareLabel.toLowerCase()}. Ofrecer un producto adicional al cobrar ayuda a subirlo.`,
      basis: "Ticket promedio",
    });
  }
  if (d.kpis.peakHour) {
    tips.push({
      key: "peak",
      text: `Vendes más entre las ${d.kpis.peakHour.replace(" a ", " y las ")}. Asegúrate de tener caja, personal y el equipo cargado a esa hora.`,
      basis: "Hora de más venta",
    });
  }
  return tips.slice(0, 3);
}

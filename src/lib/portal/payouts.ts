// Abonos (contrato: docs/portal/contratos.md §4). Cálculo de presentación
// como función pura. Sin imports de next/*.
import { PortalApiError, portalRequest } from "./auth.ts";
import { cardLabel, MONTHS } from "./day.ts";
import { dayName } from "./sales.ts";

type Card = { brand: string | null; type: "credit" | "debit" | null; last_four: string | null };
type Amounts = { gross_amount: number; sales_count: number; commission: number; commission_tax: number; adjustment: number; amount: number };

export type Available = Amounts & { sale_date: string; as_of: string };
export type Payout = Amounts & {
  uuid: string;
  sale_date: string;
  status: "in_process" | "paid" | "rejected";
  paid_on: string | null;
  sent_on: string;
  method: "estimated" | "reconciled";
  reconciled_at: string | null;
  pending_difference: number;
};
export type PayoutsData = { as_of: string; available: Available[]; next: Payout | null; payouts: Payout[] };
type Movement =
  | {
      kind: "sale";
      sale_uuid: string | null;
      time: string | null;
      folio: number;
      dte_type_name: string;
      amount: number;
      card: Card | null;
      commission: number | null;
      commission_tax: number | null;
      difference: number | null;
    }
  | { kind: "adjustment"; origin_sale_date: string; amount: number };
export type PayoutDetailData = Payout & { movements: Movement[] };

// Primer mes con abonos Kushki en el portal.
const FIRST_MONTH = "2026-10";

const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const nul = (v: unknown) => v === null || num(v);
const str = (v: unknown) => typeof v === "string";
const iso = (v: unknown) => str(v) && /^\d{4}-\d{2}-\d{2}$/.test(v as string);
const amounts = (a: Amounts) => [a.gross_amount, a.sales_count, a.commission, a.commission_tax, a.adjustment, a.amount].every(num);
const payout = (p: Payout | null) =>
  !!p &&
  str(p.uuid) &&
  iso(p.sale_date) &&
  iso(p.sent_on) &&
  ["in_process", "paid", "rejected"].includes(p.status) &&
  (p.paid_on === null || iso(p.paid_on)) &&
  amounts(p) &&
  num(p.pending_difference);
const movement = (m: Movement) =>
  m?.kind === "sale"
    ? str(m.dte_type_name) && num(m.folio) && num(m.amount) && (m.time === null || str(m.time)) && [m.commission, m.commission_tax, m.difference].every(nul)
    : m?.kind === "adjustment" && iso(m.origin_sale_date) && num(m.amount);

// Un 200 con forma inesperada es un tomahawk roto: se trata como servicio caído.
const malformed = () => new PortalApiError("NETWORK", 502);

export async function getPayouts(jwt: string, from: string, to: string): Promise<PayoutsData> {
  const d = await portalRequest<PayoutsData>(`/api/portal/v1/payouts?${new URLSearchParams({ from, to })}`, {
    headers: { "x-token-dtex": jwt },
  });
  const ok =
    str(d.as_of) &&
    Array.isArray(d.available) &&
    d.available.every((a) => iso(a.sale_date) && amounts(a)) &&
    (d.next === null || payout(d.next)) &&
    Array.isArray(d.payouts) &&
    d.payouts.every(payout);
  if (!ok) throw malformed();
  return d;
}

export async function getPayout(jwt: string, uuid: string): Promise<PayoutDetailData> {
  const d = await portalRequest<PayoutDetailData>(`/api/portal/v1/payouts/${encodeURIComponent(uuid)}`, {
    headers: { "x-token-dtex": jwt },
  });
  if (!payout(d) || !Array.isArray(d.movements) || !d.movements.every(movement)) throw malformed();
  return d;
}

/** Mes pedido (YYYY-MM) si está entre octubre de 2026 y el mes actual; si no, el actual. */
export function parseMonth(raw: string | string[] | undefined, today: string): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const current = today.slice(0, 7);
  if (!v || !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return current;
  return v < FIRST_MONTH || v > current ? current : v;
}

const lastDay = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
};

const shiftMonth = (month: string, n: number) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
};

export function monthRange(month: string, today: string): { from: string; to: string } {
  const end = lastDay(month);
  return { from: `${month}-01`, to: end > today ? today : end };
}

/** "miércoles 11 de noviembre"; el año solo si no es el de hoy. */
function longDate(date: string, today: string): string {
  const year = date.slice(0, 4) === today.slice(0, 4) ? "" : ` de ${date.slice(0, 4)}`;
  return `${dayName(date)} de ${MONTHS[Number(date.slice(5, 7)) - 1]}${year}`;
}

const sales = (n: number) => `${n.toLocaleString("es-CL")} ${n === 1 ? "venta" : "ventas"}`;

function lines(a: Amounts) {
  const l = [
    { label: `Ventas con tarjeta, ${sales(a.sales_count)}`, amount: a.gross_amount },
    { label: "Comisión", amount: -a.commission },
    { label: "IVA de la comisión", amount: -a.commission_tax },
  ];
  if (a.adjustment) l.push({ label: "Regularización de abonos anteriores", amount: a.adjustment });
  return l;
}

// El comercio no ve rechazos: el pago se reintenta y para él sigue pendiente.
function state(p: Payout, today: string) {
  return p.status === "paid" && p.paid_on
    ? { state: "paid" as const, stateLabel: `Pagado el ${longDate(p.paid_on, today)}` }
    : { state: "pending" as const, stateLabel: "Pendiente de pago" };
}

export type PayoutsView = ReturnType<typeof buildPayouts>;

export function buildPayouts(d: PayoutsData, month: string, today: string) {
  const name = MONTHS[Number(month.slice(5, 7)) - 1];
  return {
    title: `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${month.slice(0, 4)}`,
    prevMonth: month > FIRST_MONTH ? shiftMonth(month, -1) : null,
    nextMonth: month < today.slice(0, 7) ? shiftMonth(month, 1) : null,
    available: d.available.map((a) => ({ key: a.sale_date, sale: longDate(a.sale_date, today), amount: a.amount, lines: lines(a) })),
    rows: d.payouts.map((p) => ({
      uuid: p.uuid,
      sale: longDate(p.sale_date, today),
      amount: p.amount,
      lines: lines(p),
      ...state(p, today),
    })),
  };
}

export type PayoutView = ReturnType<typeof buildPayout>;

export function buildPayout(d: PayoutDetailData, today: string) {
  const movements = d.movements.map((m, i) =>
    m.kind === "sale"
      ? {
          kind: "sale" as const,
          key: m.sale_uuid ?? `s-${i}`,
          time: m.time ? m.time.slice(0, 5) : "—",
          document: `${m.dte_type_name} N° ${m.folio}`,
          method: cardLabel(m.card),
          amount: m.amount,
          // ponytail: sin detalle por venta (abonos anteriores a la tabla de tomahawk) no hay comisión que mostrar.
          fee: m.commission === null || m.commission_tax === null ? null : -(m.commission + m.commission_tax),
          difference: m.difference ?? 0,
        }
      : {
          kind: "adjustment" as const,
          key: `a-${i}`,
          label: `Diferencia de las ventas del ${longDate(m.origin_sale_date, today)}`,
          amount: m.amount,
        },
  );
  return {
    title: `Abono de las ventas del ${longDate(d.sale_date, today)}`,
    amount: d.amount,
    lines: lines(d),
    ...state(d, today),
    sentOn: longDate(d.sent_on, today),
    methodNote:
      d.method === "reconciled"
        ? "Monto conciliado con Kushki."
        : "Monto estimado: se confirma cuando Kushki informa el tipo de cada tarjeta.",
    pendingDifference: d.pending_difference,
    salesHref: `/portal/ventas?fecha=${d.sale_date}&medio=card`,
    hasFees: movements.some((m) => m.kind === "sale" && m.fee !== null),
    movements,
  };
}

/** Para el Inicio: el abono enviado que falta pagar o, si no hay, el disponible más antiguo. */
export function nextPayout(d: PayoutsData, today: string) {
  if (d.next) {
    return {
      title: "Próximo abono",
      amount: d.next.amount,
      note: `Ventas del ${longDate(d.next.sale_date, today)}, pendiente de pago`,
      href: `/portal/abonos/${d.next.uuid}`,
    };
  }
  const a = [...d.available].sort((x, y) => x.sale_date.localeCompare(y.sale_date))[0];
  return a
    ? { title: "Abono disponible", amount: a.amount, note: `Ventas del ${longDate(a.sale_date, today)}, en espera de pago`, href: "/portal/abonos" }
    : null;
}

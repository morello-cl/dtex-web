// Ventas de un día (contrato: docs/portal/contratos.md §3). Cálculo de
// presentación como función pura. Sin imports de next/*.
import { PortalApiError, portalRequest } from "./auth.ts";
import { dayName } from "./sales.ts";

export type Method = "cash" | "card";
type CardType = "credit" | "debit" | null;
type Card = { brand: string | null; type: CardType; last_four: string | null };

export type SalesDayData = {
  date: string;
  as_of: string;
  totals: {
    amount: number;
    count: number;
    tip_amount: number;
    cashback_amount: number;
    by_payment_method: {
      payment_method: string;
      amount: number;
      count: number;
      tip_amount: number;
      cashback_amount: number;
      by_card_type?: { type: CardType; amount: number; count: number }[];
    }[];
    by_document: { dte_type: number; dte_type_name: string; amount: number; count: number }[];
  };
  sales: {
    uuid: string | null;
    time: string | null;
    folio: number;
    dte_type: number;
    dte_type_name: string;
    amount: number;
    tip_amount: number;
    cashback_amount: number;
    payment_method: string;
    voided: boolean;
    card: Card | null;
    equipment: { uuid: string; tid: string };
    subsidiary: { uuid: string; name: string };
  }[];
  next_cursor: string | null;
  rejections: {
    kind: "rejected" | "cancelled";
    occurred_at: string;
    time: string | null;
    amount: number;
    payment_method: string;
    provider: string | null;
    reason: string | null;
    message: string | null;
    card: Card | null;
    equipment: { uuid: string; tid: string } | null;
  }[];
};

const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);

export async function getSalesDay(
  jwt: string,
  date: string,
  method: Method | null,
  cursor: string | null,
): Promise<SalesDayData> {
  const q = new URLSearchParams({ date });
  if (method) q.set("payment_method", method);
  if (cursor) q.set("cursor", cursor);
  const d = await portalRequest<SalesDayData>(`/api/portal/v1/sales/day?${q}`, {
    headers: { "x-token-dtex": jwt },
  });
  const t = d.totals;
  const ok =
    typeof d.date === "string" &&
    [t?.amount, t?.count, t?.tip_amount, t?.cashback_amount].every(num) &&
    Array.isArray(t.by_payment_method) &&
    t.by_payment_method.every((m) => typeof m.payment_method === "string" && [m.amount, m.count].every(num)) &&
    Array.isArray(t.by_document) &&
    t.by_document.every((x) => typeof x.dte_type_name === "string" && [x.amount, x.count].every(num)) &&
    Array.isArray(d.sales) &&
    d.sales.every(
      (s) =>
        typeof s.dte_type_name === "string" &&
        typeof s.payment_method === "string" &&
        [s.amount, s.tip_amount, s.cashback_amount].every(num),
    ) &&
    (d.next_cursor === null || typeof d.next_cursor === "string") &&
    Array.isArray(d.rejections) &&
    d.rejections.every((r) => num(r.amount));
  // Un 200 con forma inesperada es un tomahawk roto: se trata como servicio caído.
  if (!ok) throw new PortalApiError("NETWORK", 502);
  return d;
}

/** Fecha de hoy en Chile, YYYY-MM-DD. */
export function chileToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(now);
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Primer día consultable: hace 2 años. */
export const minDate = (today: string) => `${Number(today.slice(0, 4)) - 2}${today.slice(4)}`;

/** Fecha pedida si es real y está entre hace 2 años y hoy; si no, hoy. */
export function parseDate(raw: string | string[] | undefined, today: string): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return today;
  if (addDays(v, 0) !== v) return today; // 2026-02-30 se corre al 2 de marzo
  return v > today || v < minDate(today) ? today : v;
}

export function parseMethod(raw: string | string[] | undefined): Method | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "cash" || v === "card" ? v : null;
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const METHOD_LABELS: Record<string, string> = { cash: "Efectivo", card: "Tarjeta" };
const CARD_TYPES: Record<string, string> = { credit: "crédito", debit: "débito" };

// Un medio nuevo se muestra con su nombre hasta que tenga etiqueta propia.
const methodLabel = (m: string) => METHOD_LABELS[m] ?? m.charAt(0).toUpperCase() + m.slice(1);

function cardLabel(c: Card | null): string {
  if (!c) return "Tarjeta";
  const parts = [c.brand ?? "Tarjeta"];
  if (c.type) parts.push(CARD_TYPES[c.type]);
  if (c.last_four) parts.push(`••${c.last_four}`);
  return parts.join(" ");
}

function attempt(r: SalesDayData["rejections"][number], i: number) {
  return {
    key: `${r.occurred_at}-${i}`,
    time: r.time ? r.time.slice(0, 5) : "—",
    method: r.payment_method === "card" ? cardLabel(r.card) : methodLabel(r.payment_method),
    reason: r.message, // `reason` es un código interno, no un texto para el comercio

    amount: r.amount,
  };
}

export type DayView = ReturnType<typeof buildDay>;

export function buildDay(d: SalesDayData, method: Method | null, today: string) {
  const month = MONTHS[Number(d.date.slice(5, 7)) - 1];
  const sameYear = d.date.slice(0, 4) === today.slice(0, 4);
  const long = `${dayName(d.date)} de ${month}${sameYear ? "" : ` de ${d.date.slice(0, 4)}`}`;
  const isToday = d.date === today;

  // La tira termina hoy; si el día pedido ya no cabe, termina 6 días después de él.
  const end = d.date > addDays(today, -14) ? today : addDays(d.date, 6);
  const strip = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(end, i - 13);
    return {
      date,
      day: Number(date.slice(8)),
      label: date === today ? "hoy" : DAY_SHORT[new Date(`${date}T00:00:00Z`).getUTCDay()],
      selected: date === d.date,
    };
  });

  return {
    date: d.date,
    isToday,
    title: isToday ? `Hoy, ${long}` : long,
    asOf: d.as_of.slice(11, 16),
    method,
    strip,
    prevDate: addDays(d.date, -1),
    nextDate: isToday ? null : addDays(d.date, 1),
    total: d.totals.amount,
    count: d.totals.count,
    tip: d.totals.tip_amount,
    cashback: d.totals.cashback_amount,
    methods: d.totals.by_payment_method.map((m) => ({
      key: m.payment_method,
      label: methodLabel(m.payment_method),
      amount: m.amount,
      count: m.count,
      sub: (m.by_card_type ?? []).map((c) => ({
        label: c.type ? CARD_TYPES[c.type].replace(/^./, (x) => x.toUpperCase()) : "Otras",
        amount: c.amount,
        count: c.count,
      })),
    })),
    documents: d.totals.by_document,
    rows: d.sales.map((s) => ({
      key: s.uuid ?? `${s.dte_type}-${s.folio}`,
      time: s.time ? s.time.slice(0, 5) : "—",
      document: `${s.dte_type_name} N° ${s.folio}`,
      isCard: s.payment_method === "card",
      method: s.payment_method === "card" ? cardLabel(s.card) : methodLabel(s.payment_method),
      place: `${s.subsidiary.name}, equipo ${s.equipment.tid}`,
      amount: s.amount,
      tip: s.tip_amount,
      cashback: s.cashback_amount,
      negative: s.amount < 0,
      voided: s.voided,
    })),
    nextCursor: d.next_cursor,
    // Una cancelación del cliente no es un rechazo del banco: van separadas.
    rejected: d.rejections.filter((r) => r.kind !== "cancelled").map(attempt),
    cancelled: d.rejections.filter((r) => r.kind === "cancelled").map(attempt),
  };
}

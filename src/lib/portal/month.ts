// Ventas de un mes (contrato: docs/portal/contratos.md §7). Cálculo de
// presentación como función pura. Sin imports de next/*.
import { PortalApiError, portalRequest } from "./auth.ts";
import { MONTHS, methodLabel, type SalesDayData } from "./day.ts";
import { shiftMonth } from "./payouts.ts";
import { dayName } from "./sales.ts";

type MonthDay = {
  date: string;
  amount: number;
  count: number;
  tip_amount: number;
  cashback_amount: number;
  cash_amount: number;
  cash_count: number;
  card_amount: number;
  card_count: number;
};

export type SalesMonthData = {
  month: string;
  as_of: string;
  totals: Pick<SalesDayData["totals"], "amount" | "count" | "tip_amount" | "cashback_amount" | "by_payment_method" | "by_document">;
  days: MonthDay[];
};

const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const str = (v: unknown) => typeof v === "string";

export async function getSalesMonth(jwt: string, month: string): Promise<SalesMonthData> {
  const d = await portalRequest<SalesMonthData>(`/api/portal/v1/sales/month?${new URLSearchParams({ month })}`, {
    headers: { "x-token-dtex": jwt },
  });
  const t = d.totals;
  const ok =
    d.month === month &&
    str(d.as_of) &&
    [t?.amount, t?.count, t?.tip_amount, t?.cashback_amount].every(num) &&
    Array.isArray(t.by_payment_method) &&
    t.by_payment_method.every((m) => str(m.payment_method) && [m.amount, m.count].every(num)) &&
    Array.isArray(t.by_document) &&
    t.by_document.every((x) => str(x.dte_type_name) && [x.dte_type, x.amount, x.count].every(num)) &&
    Array.isArray(d.days) &&
    d.days.every(
      (x) =>
        str(x.date) &&
        x.date.startsWith(month) &&
        [x.amount, x.count, x.tip_amount, x.cashback_amount, x.cash_amount, x.cash_count, x.card_amount, x.card_count].every(num),
    );
  // Un 200 con forma inesperada es un tomahawk roto: se trata como servicio caído.
  if (!ok) throw new PortalApiError("NETWORK", 502);
  return d;
}

/** Primer mes consultable: el mismo mes de hace 2 años (§7, límite inclusivo). */
export const minMonth = (today: string) => `${Number(today.slice(0, 4)) - 2}${today.slice(4, 7)}`;

/** Mes pedido si es real y está en el rango del §7; si no, null (y la página muestra el día). */
export function parseSalesMonth(raw: string | string[] | undefined, today: string): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return null;
  return v < minMonth(today) || v > today.slice(0, 7) ? null : v;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export type MonthView = ReturnType<typeof buildMonth>;

export function buildMonth(d: SalesMonthData, today: string) {
  const current = today.slice(0, 7);
  const min = minMonth(today);
  const best = d.days.reduce<MonthDay | null>((a, x) => (x.amount > 0 && (!a || x.amount > a.amount) ? x : a), null);
  return {
    month: d.month,
    isCurrent: d.month === current,
    title: `${cap(MONTHS[Number(d.month.slice(5, 7)) - 1])} de ${d.month.slice(0, 4)}`,
    asOf: d.as_of.slice(11, 16),
    min,
    max: current,
    // Flechas ‹ ›: null en los bordes del rango del §7.
    prev: d.month > min ? shiftMonth(d.month, -1) : null,
    next: d.month < current ? shiftMonth(d.month, 1) : null,
    total: d.totals.amount,
    count: d.totals.count,
    tip: d.totals.tip_amount,
    cashback: d.totals.cashback_amount,
    methods: d.totals.by_payment_method.map((m) => ({ key: m.payment_method, label: methodLabel(m.payment_method), amount: m.amount, count: m.count })),
    documents: d.totals.by_document,
    // Lo más reciente arriba, como en Abonos. Los días sin ventas quedan: el comercio ve que no vendió.
    rows: d.days
      .map((x) => ({
        date: x.date,
        label: cap(dayName(x.date)),
        href: `/portal/ventas?fecha=${x.date}`,
        amount: x.amount,
        count: x.count,
        cash: x.cash_amount,
        card: x.card_amount,
        tip: x.tip_amount,
        best: x === best,
        empty: x.count === 0,
      }))
      .reverse(),
  };
}

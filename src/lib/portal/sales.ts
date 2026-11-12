// Ventas de Inicio (contrato: docs/portal/contratos.md §2). Todo el cálculo de
// presentación vive aquí, como función pura. Sin imports de next/*.
import { PortalApiError, portalRequest } from "./auth.ts";

export type WindowKey = "current" | "week_1" | "week_2" | "week_4" | "week_8" | "week_52";
export type CompareKey = Exclude<WindowKey, "current">;

export type SalesDay = {
  date: string;
  amount: number;
  count: number;
  card_amount: number;
  tip_amount: number;
  cashback_amount: number;
};
export type SalesWindow = { from: string; to: string; days: SalesDay[] };
export type SalesSummary = {
  as_of: string;
  first_sale_date: string | null;
  windows: Record<WindowKey, SalesWindow>;
  hourly: { hour: number; amount: number }[];
};

export const COMPARE_LABELS: Record<CompareKey, string> = {
  week_1: "Semana anterior",
  week_2: "Hace 2 semanas",
  week_4: "Hace 1 mes",
  week_8: "Hace 2 meses",
  week_52: "Hace 1 año",
};
const COMPARE_KEYS = Object.keys(COMPARE_LABELS) as CompareKey[];
const WINDOW_KEYS: WindowKey[] = ["current", ...COMPARE_KEYS];

export async function getSalesSummary(jwt: string): Promise<SalesSummary> {
  const s = await portalRequest<SalesSummary>("/api/portal/v1/sales/summary", {
    headers: { "x-token-dtex": jwt },
  });
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  const ok =
    typeof s.as_of === "string" &&
    (s.first_sale_date === null || typeof s.first_sale_date === "string") &&
    Array.isArray(s.hourly) &&
    s.hourly.every((h) => num(h.hour) && num(h.amount)) &&
    WINDOW_KEYS.every((k) => {
      const w = s.windows?.[k];
      return (
        typeof w?.from === "string" &&
        typeof w.to === "string" &&
        w.days?.length === 7 &&
        w.days.every(
          (d) =>
            typeof d.date === "string" &&
            [d.amount, d.count, d.card_amount, d.tip_amount, d.cashback_amount].every(num),
        )
      );
    });
  // Un 200 con forma inesperada es un tomahawk roto: se trata como servicio caído.
  if (!ok) throw new PortalApiError("NETWORK", 502);
  return s;
}

export function parseCompare(raw: string | string[] | undefined): CompareKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return COMPARE_KEYS.includes(v as CompareKey) ? (v as CompareKey) : "week_1";
}

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatClp(n: number): string {
  return clp.format(n).replace(/\s/g, "");
}

export function formatDelta(pct: number | null): string {
  if (pct === null) return "—";
  const r = Math.round(pct * 10) / 10;
  const sign = r > 0 ? "+" : r < 0 ? "-" : "";
  return `${sign}${Math.abs(r).toFixed(1).replace(".", ",")}%`;
}

export type Dashboard = {
  empty: boolean;
  rangeLabel: string;
  total: number;
  delta: number | null;
  compareLabel: string;
  days: {
    label: string;
    date: string;
    current: number;
    previous: number;
    isToday: boolean;
    currentHeight: number;
    previousHeight: number;
  }[];
  today: string;
  ruler: { key: CompareKey; label: string; total: number | null; width: number }[];
  rulerCurrentAt: number;
  rulerReading: string;
  kpis: {
    count: number;
    countDelta: number | null;
    ticket: number;
    ticketDelta: number | null;
    cardShare: number;
    peakHour: string | null;
    sale: number;
    tip: number;
    cashback: number;
  };
};

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DAY_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

// Fecha YYYY-MM-DD como fecha de calendario: UTC evita el corrimiento de zona.
function weekday(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}
function dayName(iso: string): string {
  return `${DAY_NAMES[weekday(iso)]} ${Number(iso.slice(8, 10))}`;
}

const sum = (days: SalesDay[], f: (d: SalesDay) => number) => days.reduce((a, d) => a + f(d), 0);
// Con un previo en 0 o negativo (notas de crédito) el % no tiene sentido: "—".
const pct = (cur: number, prev: number | null) => (prev !== null && prev > 0 ? ((cur - prev) / prev) * 100 : null);
const scale = (n: number, max: number) => (max > 0 ? Math.max(0, (n / max) * 100) : 0);

// Frase para "hace 1 mes" / "la semana anterior" dentro de una oración.
function inSentence(k: CompareKey): string {
  return k === "week_1" ? "la semana anterior" : COMPARE_LABELS[k].toLowerCase();
}

export function buildDashboard(s: SalesSummary, vs: CompareKey): Dashboard {
  const cur = s.windows.current.days;
  // Período sin datos: termina antes de la primera venta (o aún no hay ventas).
  const hasData = (k: CompareKey) => s.first_sale_date !== null && s.windows[k].to >= s.first_sale_date;
  const totalOf = (k: WindowKey) => sum(s.windows[k].days, (d) => d.amount);

  const total = totalOf("current");
  const prevDays = hasData(vs) ? s.windows[vs].days : null;
  const prevTotal = prevDays ? totalOf(vs) : null;

  const series = cur.map((d, i) => ({ d, prev: prevDays ? prevDays[i].amount : 0 }));
  const dayMax = Math.max(0, ...series.flatMap((x) => [x.d.amount, x.prev]));
  const days = series.map(({ d, prev }, i) => ({
    label: DAY_SHORT[weekday(d.date)],
    date: dayName(d.date),
    current: d.amount,
    previous: prev,
    isToday: i === cur.length - 1,
    currentHeight: scale(d.amount, dayMax),
    previousHeight: scale(prev, dayMax),
  }));

  const todayAmount = cur[cur.length - 1].amount;
  let today = "Hoy aún no registras ventas.";
  if (todayAmount > 0) {
    const prevToday = prevDays ? prevDays[prevDays.length - 1] : null;
    const p = prevToday ? pct(todayAmount, prevToday.amount) : null;
    today = `Hoy llevas ${formatClp(todayAmount)}`;
    if (p !== null && prevToday) {
      const when = `que el ${dayName(prevToday.date)} a esta hora`;
      const r = Math.round(p * 10) / 10;
      today +=
        r === 0
          ? `, lo mismo ${when}`
          : `, ${formatDelta(Math.abs(r)).replace("+", "")} ${r > 0 ? "más" : "menos"} ${when}`;
    }
    today += ".";
  }

  const ruler = COMPARE_KEYS.map((key) => ({
    key,
    label: COMPARE_LABELS[key],
    total: hasData(key) ? totalOf(key) : null,
  }));
  const rulerMax = Math.max(total, ...ruler.map((r) => r.total ?? 0));
  const withData = ruler.filter((r) => r.total !== null);
  const above = withData.filter((r) => r.total! > total);
  const below = withData.filter((r) => r.total! < total);
  let rulerReading: string;
  if (withData.length === 0) rulerReading = "Aún no hay períodos anteriores para comparar.";
  else if (total <= 0 && above.length === 0) rulerReading = "No registras ventas en estos períodos.";
  else if (below.length === withData.length) rulerReading = "Vendiste más que en todos los períodos anteriores.";
  else if (above.length === withData.length) rulerReading = "Vendiste menos que en todos los períodos anteriores.";
  else if (above.length === 1 && below.length === withData.length - 1)
    rulerReading = `Solo ${inSentence(above[0].key)} vendiste más que ahora.`;
  else rulerReading = `Vendiste más que en ${below.length} de ${withData.length} períodos.`;

  const count = sum(cur, (d) => d.count);
  const ticket = count ? Math.round(total / count) : 0;
  const prevCount = prevDays ? sum(prevDays, (d) => d.count) : null;
  const prevTicket = prevCount && prevTotal !== null ? Math.round(prevTotal / prevCount) : null;
  const card = sum(cur, (d) => d.card_amount);
  const tip = sum(cur, (d) => d.tip_amount);
  const cashback = sum(cur, (d) => d.cashback_amount);
  const peak = s.hourly.reduce((a, h) => (h.amount > a.amount ? h : a), { hour: -1, amount: 0 });

  return {
    empty: s.first_sale_date === null,
    rangeLabel: `del ${dayName(s.windows.current.from)} al ${dayName(s.windows.current.to)} a las ${s.as_of.slice(11, 16)}`,
    total,
    delta: pct(total, prevTotal),
    compareLabel: COMPARE_LABELS[vs],
    days,
    today,
    ruler: ruler.map((r) => ({ ...r, width: scale(r.total ?? 0, rulerMax) })),
    rulerCurrentAt: scale(total, rulerMax),
    rulerReading,
    kpis: {
      count,
      countDelta: pct(count, prevCount),
      ticket,
      ticketDelta: pct(ticket, prevTicket),
      cardShare: total > 0 ? Math.round((100 * card) / total) : 0,
      peakHour: peak.hour >= 0 ? `${peak.hour} a ${peak.hour + 1} h` : null,
      sale: total - tip - cashback,
      tip,
      cashback,
    },
  };
}

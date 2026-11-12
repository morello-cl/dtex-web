import assert from "node:assert/strict";
import test from "node:test";
import { PortalApiError } from "./auth.ts";
import {
  buildDashboard,
  formatClp,
  formatDelta,
  getSalesSummary,
  parseCompare,
  type SalesSummary,
  type SalesWindow,
} from "./sales.ts";

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Ventana de 7 días que termina en `to`; cada día: monto, 10 ventas, 60% tarjeta.
function win(to: string, amounts: number[], extra: { tip?: number; cashback?: number } = {}): SalesWindow {
  return {
    from: addDays(to, -6),
    to,
    days: amounts.map((amount, i) => ({
      date: addDays(to, i - 6),
      amount,
      count: amount ? 10 : 0,
      card_amount: Math.round(amount * 0.6),
      tip_amount: amount ? (extra.tip ?? 0) : 0,
      cashback_amount: amount ? (extra.cashback ?? 0) : 0,
    })),
  };
}

const CURRENT = [612000, 701300, 845000, 530000, 698000, 714000, 412600]; // 4.512.900
const WEEK_1 = [580000, 690000, 800000, 510000, 560000, 544300, 425800]; // 4.110.100

function summary(over: Partial<SalesSummary> = {}): SalesSummary {
  const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour, amount: hour === 12 ? 900000 : hour * 1000 }));
  return {
    as_of: "2026-11-12T15:04:00-03:00",
    first_sale_date: "2026-03-14",
    windows: {
      current: win("2026-11-12", CURRENT, { tip: 1000, cashback: 2000 }),
      week_1: win("2026-11-05", WEEK_1),
      week_2: win("2026-10-29", Array(7).fill(0)),
      week_4: win("2026-10-15", Array(7).fill(700000)),
      week_8: win("2026-09-17", Array(7).fill(500000)),
      week_52: win("2025-11-13", Array(7).fill(0)),
    },
    hourly,
    ...over,
  };
}

test("total y variación contra la semana anterior", () => {
  const d = buildDashboard(summary(), "week_1");
  assert.equal(d.total, 4512900);
  assert.equal(formatClp(d.total), "$4.512.900");
  assert.equal(formatDelta(d.delta), "+9,8%");
  assert.equal(d.compareLabel, "Semana anterior");
  assert.equal(d.rangeLabel, "del viernes 6 al jueves 12 a las 15:04");
});

test("formatDelta: signo, coma y null", () => {
  assert.equal(formatDelta(-3.14), "-3,1%");
  assert.equal(formatDelta(0.01), "0,0%");
  assert.equal(formatDelta(null), "—");
});

test("parseCompare: inválido o ausente → week_1", () => {
  assert.equal(parseCompare(undefined), "week_1");
  assert.equal(parseCompare("week_99"), "week_1");
  assert.equal(parseCompare("current"), "week_1");
  assert.equal(parseCompare(["week_4"]), "week_4");
});

test("comparativo en 0 → delta null y '—'", () => {
  const d = buildDashboard(summary(), "week_2");
  assert.equal(d.delta, null);
  assert.equal(formatDelta(d.delta), "—");
  assert.equal(d.kpis.countDelta, null);
  assert.equal(d.kpis.ticketDelta, null);
});

test("período antes de first_sale_date → sin datos, nunca 0%", () => {
  const d = buildDashboard(summary(), "week_52");
  assert.equal(d.ruler.find((r) => r.key === "week_52")!.total, null);
  assert.equal(d.ruler.find((r) => r.key === "week_2")!.total, 0);
  assert.equal(d.delta, null);
});

test("hoy sin ventas → 'Hoy aún no registras ventas.'", () => {
  const s = summary();
  s.windows.current.days[6].amount = 0;
  assert.equal(buildDashboard(s, "week_1").today, "Hoy aún no registras ventas.");
});

test("hoy con ventas → frase con monto, % y día comparado", () => {
  assert.equal(
    buildDashboard(summary(), "week_1").today,
    "Hoy llevas $412.600, 3,1% menos que el jueves 5 a esta hora.",
  );
  assert.equal(buildDashboard(summary(), "week_2").today, "Hoy llevas $412.600.");
});

test("todo en 0 → empty con first_sale_date null y alturas 0, no NaN", () => {
  const z = Array(7).fill(0);
  const s = summary({ first_sale_date: null, hourly: Array.from({ length: 24 }, (_, hour) => ({ hour, amount: 0 })) });
  for (const k of Object.keys(s.windows) as (keyof typeof s.windows)[]) s.windows[k] = win(s.windows[k].to, z);
  const d = buildDashboard(s, "week_1");
  assert.equal(d.empty, true);
  for (const day of d.days) {
    assert.equal(day.currentHeight, 0);
    assert.equal(day.previousHeight, 0);
  }
  assert.equal(d.rulerCurrentAt, 0);
  assert.ok(d.ruler.every((r) => r.width === 0));
  assert.equal(d.kpis.ticket, 0);
  assert.equal(d.kpis.cardShare, 0);
  assert.equal(d.kpis.peakHour, null);
});

test("alturas: el máximo de ambas series es 100", () => {
  const d = buildDashboard(summary(), "week_1");
  const all = d.days.flatMap((x) => [x.currentHeight, x.previousHeight]);
  assert.equal(Math.max(...all), 100);
  assert.equal(d.days[2].currentHeight, 100); // 845.000 es el máximo
  assert.equal(d.days[6].label, "jue");
  assert.equal(d.days[1].label, "sáb");
  assert.equal(d.days[6].isToday, true);
});

test("lectura de la regla", () => {
  assert.equal(buildDashboard(summary(), "week_1").rulerReading, "Solo hace 1 mes vendiste más que ahora.");

  const s = summary();
  s.windows.week_4 = win("2026-10-15", Array(7).fill(100));
  assert.equal(buildDashboard(s, "week_1").rulerReading, "Vendiste más que en todos los períodos anteriores.");

  const big = summary();
  for (const k of ["week_1", "week_2", "week_4", "week_8"] as const) big.windows[k] = win(big.windows[k].to, Array(7).fill(900000));
  assert.equal(buildDashboard(big, "week_1").rulerReading, "Vendiste menos que en todos los períodos anteriores.");

  const mix = summary();
  mix.windows.week_8 = win("2026-09-17", Array(7).fill(900000));
  assert.equal(buildDashboard(mix, "week_1").rulerReading, "Vendiste más que en 2 de 4 períodos.");
});

test("KPIs: ticket, % tarjeta y hora de más venta", () => {
  const k = buildDashboard(summary(), "week_1").kpis;
  assert.equal(k.count, 70);
  assert.equal(k.ticket, Math.round(4512900 / 70));
  assert.equal(k.cardShare, 60);
  assert.equal(k.peakHour, "12 a 13 h");
});

test("desglose: venta + propina + cashback = total", () => {
  const k = buildDashboard(summary(), "week_1").kpis;
  assert.equal(k.tip, 7000);
  assert.equal(k.cashback, 14000);
  assert.equal(k.sale + k.tip + k.cashback, 4512900);
});

test("getSalesSummary envía el JWT y rechaza una forma inválida", async (t) => {
  const f = t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ error: false, message: null, data: summary() }), { status: 200 }),
  );
  const s = await getSalesSummary("jwt-1");
  assert.equal(s.windows.current.days.length, 7);
  const init = f.mock.calls[0].arguments[1] as RequestInit;
  assert.equal((init.headers as Record<string, string>)["x-token-dtex"], "jwt-1");

  f.mock.mockImplementation(async () =>
    new Response(JSON.stringify({ error: false, message: null, data: { as_of: "x" } }), { status: 200 }),
  );
  await assert.rejects(getSalesSummary("jwt-1"), (e) => e instanceof PortalApiError && e.code === "NETWORK");
});

test("período previo negativo (notas de crédito) → delta null, no signo invertido", () => {
  const s = summary();
  s.windows.week_1.days[0].amount = -5000000;
  s.windows.week_1.days[6].amount = -1000;
  const d = buildDashboard(s, "week_1");
  assert.equal(d.delta, null);
  assert.equal(d.today, "Hoy llevas $412.600.");
});

test("regla: empates no cuentan como superados y todo en 0 no dice 'más'", () => {
  const z = summary();
  for (const k of Object.keys(z.windows) as (keyof typeof z.windows)[]) z.windows[k] = win(z.windows[k].to, Array(7).fill(0));
  assert.equal(buildDashboard(z, "week_1").rulerReading, "No registras ventas en estos períodos.");

  const tie = summary();
  tie.windows.week_8 = win("2026-09-17", CURRENT);
  tie.windows.week_4 = win("2026-10-15", Array(7).fill(100));
  assert.equal(buildDashboard(tie, "week_1").rulerReading, "Vendiste más que en 3 de 4 períodos.");
});

test("getSalesSummary rechaza montos que no son números", async (t) => {
  const bad = summary();
  (bad.windows.current.days[0] as unknown as { amount: string }).amount = "612000";
  t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ error: false, message: null, data: bad }), { status: 200 }),
  );
  await assert.rejects(getSalesSummary("jwt-1"), (e) => e instanceof PortalApiError && e.code === "NETWORK");
});

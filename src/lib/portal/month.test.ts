import assert from "node:assert/strict";
import test from "node:test";
import { PortalApiError } from "./auth.ts";
import { buildMonth, getSalesMonth, minMonth, parseSalesMonth, type SalesMonthData } from "./month.ts";

const day = (date: string, amount: number, count: number) => ({
  date,
  amount,
  count,
  tip_amount: 0,
  cashback_amount: 0,
  cash_amount: amount,
  cash_count: count,
  card_amount: 0,
  card_count: 0,
});

const data = (over: Partial<SalesMonthData> = {}): SalesMonthData => ({
  month: "2026-11",
  as_of: "2026-11-20T15:04:00-03:00",
  totals: {
    amount: 30000,
    count: 3,
    tip_amount: 500,
    cashback_amount: 0,
    by_payment_method: [{ payment_method: "cash", amount: 30000, count: 3, tip_amount: 500, cashback_amount: 0 }],
    by_document: [{ dte_type: 39, dte_type_name: "Boleta", amount: 30000, count: 3 }],
  },
  days: [day("2026-11-01", 10000, 1), day("2026-11-02", 0, 0), day("2026-11-03", 20000, 2)],
  ...over,
});

test("parseSalesMonth acepta de hace 2 años al mes actual, inclusivo", () => {
  const today = "2026-11-20";
  assert.equal(minMonth(today), "2024-11");
  assert.equal(parseSalesMonth("2024-11", today), "2024-11");
  assert.equal(parseSalesMonth("2026-11", today), "2026-11");
  assert.equal(parseSalesMonth("2024-10", today), null);
  assert.equal(parseSalesMonth("2026-12", today), null);
  assert.equal(parseSalesMonth("2026-13", today), null);
  assert.equal(parseSalesMonth(["2026-10", "x"], today), "2026-10");
  assert.equal(parseSalesMonth(undefined, today), null);
});

test("buildMonth: rango, flechas, días al revés y mejor día", () => {
  const v = buildMonth(data(), "2026-11-20");
  assert.equal(v.title, "Noviembre de 2026");
  assert.equal(v.isCurrent, true);
  assert.equal(v.asOf, "15:04");
  assert.deepEqual([v.min, v.max, v.prev, v.next], ["2024-11", "2026-11", "2026-10", null]);
  assert.equal(buildMonth(data({ month: "2024-11" }), "2026-11-20").prev, null);
  assert.equal(buildMonth(data({ month: "2025-12" }), "2026-11-20").next, "2026-01");
  assert.equal(v.rows[0].href, "/portal/ventas?fecha=2026-11-03");
  assert.deepEqual(v.rows.map((r) => r.date), ["2026-11-03", "2026-11-02", "2026-11-01"]);
  assert.deepEqual(v.rows.map((r) => r.best), [true, false, false]);
  assert.equal(v.rows[1].empty, true);
  assert.equal(v.methods[0].label, "Efectivo");
});

test("buildMonth sin ventas no marca mejor día", () => {
  const v = buildMonth(data({ month: "2026-10", days: [day("2026-10-01", 0, 0)] }), "2026-11-20");
  assert.equal(v.isCurrent, false);
  assert.equal(v.rows[0].best, false);
});

test("getSalesMonth arma la query, envía el JWT y rechaza formas inválidas", async (t) => {
  let body: unknown = data();
  const f = t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ error: false, message: null, data: body }), { status: 200 }));
  await getSalesMonth("jwt-1", "2026-11");
  const [url, init] = f.mock.calls[0].arguments as [URL, RequestInit];
  assert.equal(url.pathname, "/api/portal/v1/sales/month");
  assert.equal(url.searchParams.get("month"), "2026-11");
  assert.equal((init.headers as Record<string, string>)["x-token-dtex"], "jwt-1");

  body = data({ days: [{ ...day("2026-10-31", 1, 1) }] }); // día de otro mes
  await assert.rejects(getSalesMonth("jwt-1", "2026-11"), (e) => e instanceof PortalApiError && e.status === 502);
  body = data({ month: "2026-10" });
  await assert.rejects(getSalesMonth("jwt-1", "2026-11"), PortalApiError);
});

test("buildMonth: en el mes más antiguo, los días antes de los 2 años exactos no enlazan", () => {
  const v = buildMonth(data({ month: "2024-11", days: [day("2024-11-19", 1000, 1), day("2024-11-20", 2000, 1)] }), "2026-11-20");
  assert.deepEqual(v.rows.map((r) => [r.date, r.href]), [
    ["2024-11-20", "/portal/ventas?fecha=2024-11-20"],
    ["2024-11-19", null],
  ]);
  assert.equal(v.day, "2024-11-20");
  assert.equal(buildMonth(data({ month: "2025-03" }), "2026-11-20").day, "2025-03-01");
  assert.equal(buildMonth(data(), "2026-11-20").day, "2026-11-20");
});

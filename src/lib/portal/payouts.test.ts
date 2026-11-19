import assert from "node:assert/strict";
import test from "node:test";
import { PortalApiError } from "./auth.ts";
import {
  buildPayout,
  buildPayouts,
  getPayout,
  getPayouts,
  monthRange,
  nextPayout,
  parseMonth,
  type PayoutDetailData,
  type PayoutsData,
} from "./payouts.ts";

const P = (over: Partial<PayoutsData["payouts"][number]> = {}): PayoutsData["payouts"][number] => ({
  uuid: "p-11",
  sale_date: "2026-11-11",
  gross_amount: 540000,
  sales_count: 42,
  commission: 9000,
  commission_tax: 1710,
  adjustment: 4408,
  amount: 533698,
  status: "in_process",
  paid_on: null,
  sent_on: "2026-11-12",
  method: "estimated",
  reconciled_at: null,
  pending_difference: 0,
  ...over,
});

const A = { sale_date: "2026-11-11", as_of: "2026-11-12T15:04:00-03:00", gross_amount: 100000, sales_count: 8, commission: 2000, commission_tax: 380, adjustment: 0, amount: 97620 };

function list(over: Partial<PayoutsData> = {}): PayoutsData {
  return {
    as_of: "2026-11-12T15:04:00-03:00",
    available: [],
    next: P(),
    payouts: [P(), P({ uuid: "p-10", sale_date: "2026-11-10", status: "paid", paid_on: "2026-11-11", adjustment: -1200, method: "reconciled" })],
    ...over,
  };
}

const sale = (over = {}) => ({
  kind: "sale" as const,
  sale_uuid: "s-1",
  time: "14:32",
  folio: 9,
  dte_type_name: "Boleta",
  amount: 21000,
  card: { brand: "Visa", type: "debit" as const, last_four: null },
  commission: 380,
  commission_tax: 72,
  difference: 0,
  ...over,
});

function detail(over: Partial<PayoutDetailData> = {}): PayoutDetailData {
  return { ...P(), movements: [sale(), { kind: "adjustment", origin_sale_date: "2026-11-03", amount: 4408 }], ...over };
}

const ok = (data: unknown) => async () => new Response(JSON.stringify({ error: false, message: null, data }), { status: 200 });

test("parseMonth: mes actual por omisión; fuera de rango vuelve al actual", () => {
  const today = "2026-11-12";
  assert.equal(parseMonth(undefined, today), "2026-11");
  assert.equal(parseMonth("2026-10", today), "2026-10");
  assert.equal(parseMonth("2026-09", today), "2026-11"); // antes de octubre 2026 no hay datos
  assert.equal(parseMonth("2026-12", today), "2026-11");
  assert.equal(parseMonth("2026-13", today), "2026-11");
  assert.equal(parseMonth(["2026-10"], today), "2026-10");
});

test("monthRange: corta en hoy y en el 2026-10-01", () => {
  assert.deepEqual(monthRange("2026-11", "2026-11-12"), { from: "2026-11-01", to: "2026-11-12" });
  assert.deepEqual(monthRange("2026-10", "2026-11-12"), { from: "2026-10-01", to: "2026-10-31" });
  assert.deepEqual(monthRange("2027-02", "2027-03-05"), { from: "2027-02-01", to: "2027-02-28" });
});

test("lista: título del mes, navegación y estados para el comercio", () => {
  const v = buildPayouts(list(), "2026-11", "2026-11-12");
  assert.equal(v.title, "Noviembre de 2026");
  assert.deepEqual(v.months, [
    { month: "2026-10", name: "oct", year: "2026", selected: false },
    { month: "2026-11", name: "nov", year: "2026", selected: true },
  ]);
  assert.equal(v.rows[0].sale, "miércoles 11 de noviembre");
  assert.equal(v.rows[0].state, "pending");
  assert.equal(v.rows[0].stateLabel, "Pendiente de pago");
  assert.equal(v.rows[1].state, "paid");
  assert.equal(v.rows[1].stateLabel, "Pagado el miércoles 11 de noviembre");
  assert.equal(buildPayouts(list(), "2026-10", "2026-11-12").months[0].selected, true);
  assert.equal(buildPayouts(list(), "2027-01", "2027-01-05").months.length, 4);
});

test("lista: columnas por abono y resumen del mes", () => {
  const v = buildPayouts(list(), "2026-11", "2026-11-12");
  const r = v.rows[0];
  assert.deepEqual([r.salesCount, r.gross, r.fees, r.adjustment], [42, 540000, -10710, 4408]);
  assert.equal(r.href, "/portal/abonos?mes=2026-11&abono=p-11");
  assert.deepEqual(v.summary, { total: 533698 * 2, count: 2, paid: 533698, paidCount: 1, pending: 533698, pendingCount: 1 });
  assert.equal(v.adjustments, true);
  assert.equal(buildPayouts(list({ payouts: [P({ adjustment: 0 })] }), "2026-11", "2026-11-12").adjustments, false);
});

test("rechazado se muestra como pendiente de pago", () => {
  const v = buildPayouts(list({ payouts: [P({ status: "rejected" })] }), "2026-11", "2026-11-12");
  assert.equal(v.rows[0].state, "pending");
  assert.equal(v.rows[0].stateLabel, "Pendiente de pago");
});

test("desglose: regularización solo si existe; signos", () => {
  const [a, b] = buildPayouts(list(), "2026-11", "2026-11-12").rows;
  assert.deepEqual(
    a.lines.map((l) => [l.label, l.amount]),
    [
      ["Ventas con tarjeta, 42 ventas", 540000],
      ["Comisión", -9000],
      ["IVA de la comisión", -1710],
      ["Regularización de abonos anteriores", 4408],
    ],
  );
  assert.equal(b.lines.at(-1)!.amount, -1200);
  const c = buildPayouts(list({ payouts: [P({ adjustment: 0 })] }), "2026-11", "2026-11-12").rows[0];
  assert.equal(c.lines.length, 3);
});

test("abono disponible por día, en espera de pago", () => {
  const v = buildPayouts(list({ available: [A] }), "2026-11", "2026-11-12");
  assert.equal(v.available.length, 1);
  assert.equal(v.available[0].sale, "miércoles 11 de noviembre");
  assert.equal(v.available[0].amount, 97620);
  assert.equal(v.available[0].lines[0].label, "Ventas con tarjeta, 8 ventas");
});

test("detalle: estado, método, diferencia pendiente, movimientos y ajustes", () => {
  const v = buildPayout(detail({ pending_difference: -350 }), "2026-11-12");
  assert.equal(v.title, "Abono de las ventas del miércoles 11 de noviembre");
  assert.equal(v.methodNote, "Monto estimado: se confirma cuando Kushki informa el tipo de cada tarjeta.");
  assert.equal(v.pendingDifference, -350);
  assert.equal(v.salesHref, "/portal/ventas?fecha=2026-11-11&medio=card");
  const [s, adj] = v.movements;
  assert.equal(s.kind, "sale");
  assert.equal(s.kind === "sale" && s.document, "Boleta N° 9");
  assert.equal(s.kind === "sale" && s.method, "Débito Visa");
  assert.equal(s.kind === "sale" && s.fee, -452);
  assert.equal(s.kind === "sale" && s.brand, "Visa");
  assert.equal(s.kind === "sale" && s.methodNoBrand, "Débito");
  assert.equal(s.kind === "sale" && s.href, "/portal/ventas?fecha=2026-11-11&medio=card&venta=s-1");
  assert.equal(adj.kind === "adjustment" && adj.label, "Diferencia de las ventas del martes 3 de noviembre");
  assert.equal(adj.amount, 4408);
  assert.equal(buildPayout(detail({ method: "reconciled", reconciled_at: "2026-11-13T09:00:00-03:00" }), "2026-11-12").methodNote, "Monto conciliado con Kushki.");
});

test("detalle sin comisión por venta (abonos antiguos): fee null", () => {
  const v = buildPayout(detail({ movements: [sale({ commission: null, commission_tax: null, difference: null, sale_uuid: null })] }), "2026-11-12");
  const s = v.movements[0];
  assert.equal(s.kind === "sale" && s.fee, null);
  assert.equal(s.kind === "sale" && s.href, null);
  assert.equal(v.hasFees, false);
});

test("getPayouts arma la query y envía el JWT; getPayout codifica el uuid", async (t) => {
  const f = t.mock.method(globalThis, "fetch", ok(list()));
  await getPayouts("jwt-1", "2026-11-01", "2026-11-12");
  const [url, init] = f.mock.calls[0].arguments as [URL, RequestInit];
  assert.equal(url.pathname, "/api/portal/v1/payouts");
  assert.equal(url.searchParams.get("from"), "2026-11-01");
  assert.equal(url.searchParams.get("to"), "2026-11-12");
  assert.equal((init.headers as Record<string, string>)["x-token-dtex"], "jwt-1");
  f.mock.mockImplementation(ok(detail()));
  await getPayout("jwt-1", "a/b");
  assert.equal((f.mock.calls[1].arguments[0] as URL).pathname, "/api/portal/v1/payouts/a%2Fb");
});

test("formas inválidas → NETWORK", async (t) => {
  const f = t.mock.method(globalThis, "fetch", ok(null));
  const lists: [string, (d: PayoutsData) => void][] = [
    ["monto texto", (d) => ((d.payouts[0] as unknown as { amount: string }).amount = "1")],
    ["estado desconocido", (d) => ((d.payouts[0] as unknown as { status: string }).status = "x")],
    ["fecha mala", (d) => (d.payouts[0].sale_date = "11-11-2026")],
    ["available no arreglo", (d) => ((d as unknown as { available: null }).available = null)],
    ["next mal formado", (d) => ((d as unknown as { next: object }).next = {})],
  ];
  for (const [name, mutate] of lists) {
    const bad = list();
    mutate(bad);
    f.mock.mockImplementation(ok(bad));
    await assert.rejects(getPayouts("j", "2026-11-01", "2026-11-12"), (e) => e instanceof PortalApiError && e.code === "NETWORK", name);
  }
  const details: [string, (d: PayoutDetailData) => void][] = [
    ["sin movements", (d) => delete (d as Partial<PayoutDetailData>).movements],
    ["kind desconocido", (d) => d.movements.push({ kind: "otro" } as never)],
    ["venta sin monto", (d) => ((d.movements[0] as unknown as { amount: null }).amount = null)],
    ["ajuste sin fecha", (d) => ((d.movements[1] as unknown as { origin_sale_date: null }).origin_sale_date = null)],
  ];
  for (const [name, mutate] of details) {
    const bad = detail();
    mutate(bad);
    f.mock.mockImplementation(ok(bad));
    await assert.rejects(getPayout("j", "p-11"), (e) => e instanceof PortalApiError && e.code === "NETWORK", name);
  }
});

test("nextPayout: primero el enviado pendiente; si no, el disponible más antiguo; si no, null", () => {
  const n = nextPayout(list({ available: [A] }), "2026-11-12")!;
  assert.deepEqual(n, { title: "Próximo abono", amount: 533698, note: "Ventas del miércoles 11 de noviembre, pendiente de pago", href: "/portal/abonos?mes=2026-11&abono=p-11" });
  const a = nextPayout(list({ next: null, available: [{ ...A, sale_date: "2026-11-10" }, A] }), "2026-11-12")!;
  assert.equal(a.title, "Abono disponible");
  assert.equal(a.note, "Ventas del martes 10 de noviembre, en espera de pago");
  assert.equal(a.href, "/portal/abonos");
  assert.equal(nextPayout(list({ next: null }), "2026-11-12"), null);
});

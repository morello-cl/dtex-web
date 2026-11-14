import assert from "node:assert/strict";
import test from "node:test";
import { PortalApiError } from "./auth.ts";
import { badRequestTarget, buildDay, chileToday, getSalesDay, parseDate, parseMethod, type SalesDayData } from "./day.ts";

const card = (type: "credit" | "debit" | null, last_four: string | null = "1234") => ({ brand: "Visa", type, last_four });
const sale = (over: Partial<SalesDayData["sales"][number]> = {}): SalesDayData["sales"][number] => ({
  uuid: "s-1",
  time: "14:32:05",
  folio: 1234,
  dte_type: 39,
  dte_type_name: "Boleta",
  amount: 10000,
  tip_amount: 0,
  cashback_amount: 0,
  payment_method: "cash",
  voided: false,
  card: null,
  equipment: { uuid: "e-1", tid: "TID01" },
  subsidiary: { uuid: "b-1", name: "Casa matriz" },
  ...over,
});

function data(over: Partial<SalesDayData> = {}): SalesDayData {
  return {
    date: "2026-11-12",
    as_of: "2026-11-12T15:04:00-03:00",
    totals: {
      amount: 61000,
      count: 3,
      tip_amount: 1000,
      cashback_amount: 0,
      by_payment_method: [
        { payment_method: "cash", amount: 10000, count: 1, tip_amount: 0, cashback_amount: 0 },
        {
          payment_method: "card",
          amount: 51000,
          count: 2,
          tip_amount: 1000,
          cashback_amount: 0,
          by_card_type: [
            { type: "debit", amount: 21000, count: 1 },
            { type: null, amount: 30000, count: 1 },
          ],
        },
      ],
      by_document: [
        { dte_type: 39, dte_type_name: "Boleta", amount: 31000, count: 2 },
        { dte_type: 33, dte_type_name: "Factura", amount: 30000, count: 1 },
      ],
    },
    sales: [
      sale({ time: "15:01:00", folio: 9, payment_method: "card", amount: 21000, tip_amount: 1000, card: card("debit") }),
      sale({ time: "12:00:00", folio: 8, dte_type: 61, dte_type_name: "Nota de crédito", amount: -5000 }),
      sale({ time: "11:00:00", folio: 7, voided: true }),
    ],
    next_cursor: null,
    rejections: [],
    ...over,
  };
}

test("chileToday usa la hora de Chile, no UTC", () => {
  // 02:30 UTC del 13 son las 23:30 del 12 en Chile (UTC-3).
  assert.equal(chileToday(new Date("2026-11-13T02:30:00Z")), "2026-11-12");
});

test("parseDate: válida, futura, inválida, muy antigua y arreglo", () => {
  const today = "2026-11-12";
  assert.equal(parseDate("2026-11-05", today), "2026-11-05");
  assert.equal(parseDate(undefined, today), today);
  assert.equal(parseDate("2026-11-13", today), today);
  assert.equal(parseDate("2026-02-30", today), today);
  assert.equal(parseDate("hola", today), today);
  assert.equal(parseDate("2024-11-11", today), today);
  assert.equal(parseDate("2024-11-12", today), "2024-11-12");
  assert.equal(parseDate(["2026-11-01"], today), "2026-11-01");
});

test("parseMethod: cash, card o todas", () => {
  assert.equal(parseMethod("cash"), "cash");
  assert.equal(parseMethod("card"), "card");
  assert.equal(parseMethod("otro"), null);
  assert.equal(parseMethod(undefined), null);
});

test("título y tira de 14 días que termina hoy", () => {
  const d = buildDay(data(), null, "2026-11-12");
  assert.equal(d.title, "Hoy, jueves 12 de noviembre");
  assert.equal(d.strip.length, 14);
  assert.equal(d.strip[13].date, "2026-11-12");
  assert.equal(d.strip[13].label, "hoy");
  assert.equal(d.strip[13].selected, true);
  assert.equal(d.strip[0].date, "2026-10-30");
  assert.equal(d.strip[0].label, "vie");
  assert.equal(d.strip[0].day, 30);
  assert.equal(d.prevDate, "2026-11-11");
  assert.equal(d.nextDate, null);
});

test("día antiguo: la tira termina 6 días después y lo marca", () => {
  const d = buildDay(data({ date: "2026-09-01" }), null, "2026-11-12");
  assert.equal(d.title, "martes 1 de septiembre");
  assert.equal(buildDay(data({ date: "2025-12-31" }), null, "2026-11-12").title, "miércoles 31 de diciembre de 2025");
  assert.equal(d.strip[13].date, "2026-09-07");
  assert.equal(d.strip.find((s) => s.selected)!.date, "2026-09-01");
  assert.equal(d.nextDate, "2026-09-02");
});

test("resumen por medio de pago con tipos de tarjeta", () => {
  const d = buildDay(data(), null, "2026-11-12");
  assert.deepEqual(
    d.methods.map((m) => [m.label, m.amount, m.count]),
    [
      ["Efectivo", 10000, 1],
      ["Tarjeta", 51000, 2],
    ],
  );
  assert.deepEqual(
    d.methods[1].sub.map((s) => s.label),
    ["Débito", "Otras"],
  );
  assert.equal(d.methods[0].sub.length, 0);
  assert.equal(d.tip, 1000);
});

test("medio de pago desconocido se muestra con su nombre", () => {
  const t = data().totals;
  t.by_payment_method.push({ payment_method: "transferencia", amount: 0, count: 0, tip_amount: 0, cashback_amount: 0 });
  assert.equal(buildDay(data({ totals: t }), null, "2026-11-12").methods[2].label, "Transferencia");
});

test("filas: hora, documento, medio, sucursal, nota de crédito y anulada", () => {
  const [a, b, c] = buildDay(data(), null, "2026-11-12").rows;
  assert.equal(a.time, "15:01");
  assert.equal(a.document, "Boleta N° 9");
  assert.equal(a.method, "Débito Visa ••1234");
  assert.equal(a.place, "Casa matriz, equipo TID01");
  assert.equal(a.tip, 1000);
  assert.equal(b.negative, true);
  assert.equal(b.method, "Efectivo");
  assert.equal(c.voided, true);
});

test("tarjeta sin datos → 'Tarjeta'", () => {
  const rows = buildDay(
    data({ sales: [sale({ payment_method: "card", card: { brand: null, type: null, last_four: null } }), sale({ payment_method: "card", card: null })] }),
    null,
    "2026-11-12",
  ).rows;
  assert.equal(rows[0].method, "Tarjeta");
  assert.equal(rows[1].method, "Tarjeta");
});

test("sin sucursal: solo el equipo; hora de 4 dígitos", () => {
  const row = buildDay(data({ sales: [sale({ subsidiary: null, time: "14:32" })] }), null, "2026-11-12").rows[0];
  assert.equal(row.place, "Equipo TID01");
  assert.equal(row.time, "14:32");
});

test("getSalesDay acepta subsidiary null", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ error: false, message: null, data: data({ sales: [sale({ subsidiary: null })] }) }), { status: 200 }),
  );
  await getSalesDay("jwt-1", "2026-11-12", null, null);
});

test("sin hora → '—'", () => {
  assert.equal(buildDay(data({ sales: [sale({ time: null })] }), null, "2026-11-12").rows[0].time, "—");
});

test("getSalesDay arma la query, envía el JWT y rechaza formas inválidas", async (t) => {
  const f = t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ error: false, message: null, data: data() }), { status: 200 }),
  );
  await getSalesDay("jwt-1", "2026-11-12", "card", "abc");
  const [url, init] = f.mock.calls[0].arguments as [URL, RequestInit];
  assert.equal(url.pathname, "/api/portal/v1/sales/day");
  assert.equal(url.searchParams.get("date"), "2026-11-12");
  assert.equal(url.searchParams.get("payment_method"), "card");
  assert.equal(url.searchParams.get("cursor"), "abc");
  assert.equal((init.headers as Record<string, string>)["x-token-dtex"], "jwt-1");

  await getSalesDay("jwt-1", "2026-11-12", null, null);
  const u2 = f.mock.calls[1].arguments[0] as URL;
  assert.equal(u2.searchParams.has("payment_method"), false);
  assert.equal(u2.searchParams.has("cursor"), false);

  const bad = data();
  (bad.sales[0] as unknown as { amount: string }).amount = "21000";
  f.mock.mockImplementation(async () =>
    new Response(JSON.stringify({ error: false, message: null, data: bad }), { status: 200 }),
  );
  await assert.rejects(getSalesDay("jwt-1", "2026-11-12", null, null), (e) => e instanceof PortalApiError && e.code === "NETWORK");
});

test("rechazos y cancelaciones del cliente van separados; tarjeta parcial", () => {
  const base = { occurred_at: "2026-11-12T13:12:00-03:00", time: "13:12:00", amount: 15900, payment_method: "card", provider: "tuu", reason: null, equipment: null };
  const d = buildDay(
    data({
      rejections: [
        { ...base, kind: "rejected", message: "Fondos insuficientes", card: { brand: null, type: "debit", last_four: null } },
        { ...base, kind: "cancelled", message: null, card: null },
      ],
    }),
    null,
    "2026-11-12",
  );
  assert.equal(d.rejected.length, 1);
  assert.equal(d.rejected[0].reason, "Fondos insuficientes");
  assert.equal(d.rejected[0].method, "Débito");
  assert.equal(d.cancelled.length, 1);
  assert.equal(d.cancelled[0].method, "Tarjeta");
});

test("getSalesDay rechaza campos que romperían el render", async (t) => {
  const cases: [string, (d: SalesDayData) => void][] = [
    ["sucursal sin nombre", (d) => ((d.sales[0].subsidiary as unknown as { name: null }).name = null)],
    ["equipo sin tid", (d) => ((d.sales[0].equipment as unknown as { tid: number }).tid = 1)],
    ["hora numérica", (d) => ((d.sales[0] as unknown as { time: number }).time = 1432)],
    ["voided ausente", (d) => delete (d.sales[0] as Partial<SalesDayData["sales"][number]>).voided],
    ["tipo de tarjeta desconocido", (d) => ((d.totals.by_payment_method[1].by_card_type![0] as unknown as { type: string }).type = "prepaid")],
    ["fecha mal formada", (d) => (d.date = "12-11-2026")],
    ["as_of ausente", (d) => delete (d as Partial<SalesDayData>).as_of],
    ["rechazo sin kind", (d) => d.rejections.push({ occurred_at: "x", time: null, amount: 1, payment_method: 5 } as never)],
  ];
  const f = t.mock.method(globalThis, "fetch", async () => new Response("{}"));
  for (const [name, mutate] of cases) {
    const bad = data();
    mutate(bad);
    f.mock.mockImplementation(async () => new Response(JSON.stringify({ error: false, message: null, data: bad }), { status: 200 }));
    await assert.rejects(getSalesDay("jwt-1", "2026-11-12", null, null), (e) => e instanceof PortalApiError && e.code === "NETWORK", name);
  }
});

test("badRequestTarget: sin cursor, luego sin fecha, luego mantención", () => {
  assert.equal(badRequestTarget({ fecha: "2026-11-10", cursor: "x" }, "card"), "/portal/ventas?fecha=2026-11-10&medio=card");
  assert.equal(badRequestTarget({ fecha: "2026-11-10" }, null), "/portal/ventas");
  assert.equal(badRequestTarget({}, "cash"), null);
});

test("tira cerca del límite de 2 años no ofrece días fuera de rango", () => {
  const d = buildDay(data({ date: "2024-11-13" }), null, "2026-11-12");
  assert.equal(d.strip[0].date, "2024-11-12");
  assert.ok(d.strip.some((s) => s.selected));
});

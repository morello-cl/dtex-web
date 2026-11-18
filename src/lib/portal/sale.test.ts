import assert from "node:assert/strict";
import test from "node:test";
import { buildSale, getSale, type SaleDetail } from "./sale.ts";

const sale = (over: Partial<SaleDetail> = {}): SaleDetail => ({
  uuid: "u1",
  document: {
    type_code: 39, type_name: "Boleta", folio: 1234, issued_at: "2026-11-13T14:32:05-03:00",
    amounts: { net: 8403, tax: 1597, tax_rate: 19, exempt: 0, total: 10000, tip: 1000, paid: 11000, change: 0 },
    receiver: null, reference: null,
  },
  items: [{ line: 1, code: null, description: "Café", quantity: 2, unit: null, unit_price: 5000, discount_pct: null, total: 10000 }],
  payment: {
    method: "card", acquirer: "kushki",
    card: { type: "debit", brand: "Visa", last4: "1234", issuer: "Bci", foreign: false },
    authorization_code: "A1B2", installments: null, transaction_id: "T-9", paid_at: "2026-11-13T14:32:10-03:00",
    settlement: { status: "settled", settled_on: "2026-11-14" },
  },
  equipment: { uuid: "e1", tid: "TID7" },
  cashier_code: null,
  ...over,
});

test("boleta con tarjeta: título, ítems, totales y pago", () => {
  const v = buildSale(sale());
  assert.equal(v.title, "Boleta N° 1234");
  assert.equal(v.items[0].detail, "2 × $5.000");
  assert.deepEqual(v.totals.map((t) => t.label), ["Neto", "IVA (19%)", "Total del documento", "Propina"]);
  const pay = Object.fromEntries(v.payment.map((p) => [p.label, p.value]));
  assert.equal(pay["Medio"], "Débito Visa ••1234");
  assert.equal(pay["Banco"], "Bci");
  assert.equal(pay["Procesado por"], "Kushki");
  assert.equal(pay["Liquidación"], "Liquidada el 14 de noviembre de 2026");
  assert.equal(pay["Cuotas"], undefined);
  assert.equal(pay["Referencia de pago MUFIN"], "T-9");
});

test("TUU sin liquidación y Kushki liquidada sin fecha", () => {
  const tuu = sale();
  tuu.payment = { ...tuu.payment!, acquirer: "tuu", settlement: null };
  const a = Object.fromEntries(buildSale(tuu).payment.map((p) => [p.label, p.value]));
  assert.equal(a["Procesado por"], "TUU");
  assert.equal(a["Liquidación"], undefined);
  const k = sale();
  k.payment = { ...k.payment!, settlement: { status: "settled", settled_on: null } };
  const b = Object.fromEntries(buildSale(k).payment.map((p) => [p.label, p.value]));
  assert.equal(b["Liquidación"], "Liquidada");
});

test("efectivo con vuelto: sin bloque de tarjeta, el vuelto se llama vuelto", () => {
  const s = sale({ payment: { method: "cash", acquirer: null, card: null, authorization_code: null, installments: null, transaction_id: null, paid_at: null, settlement: null } });
  s.document.amounts = { ...s.document.amounts, tip: 0, paid: 20000, change: 10000 };
  const v = buildSale(s);
  assert.deepEqual(v.payment, [{ label: "Medio", value: "Efectivo" }]);
  assert.ok(v.totals.some((t) => t.label === "Vuelto" && t.value === "$10.000"));
  assert.ok(v.totals.some((t) => t.label === "Pagado"));
});

test("SII: estado, track ID y fecha de envío; sin dato no se muestra", () => {
  const s = sale();
  s.document.sii = { status: "accepted", track_id: "0234567890", sent_at: "2026-11-13T14:40:00-03:00", message: null };
  const v = buildSale(s);
  assert.equal(v.sii?.label, "Aceptado por el SII");
  assert.equal(v.sii?.tone, "ok");
  assert.equal(v.sii?.trackId, "0234567890");
  assert.equal(v.total, "$11.000");
  assert.equal(v.brand, "Visa");
  assert.equal(v.methodNoBrand, "Débito ••1234");
  assert.equal(buildSale(sale()).sii, null);
  s.document.sii = { status: "duplicate", track_id: null, sent_at: null, message: null };
  assert.equal(buildSale(s).sii?.tone, "warn");
  // Un estado que tomahawk agregue después no rompe el panel: se oculta.
  s.document.sii = { status: "constructor" as never, track_id: null, sent_at: null, message: null };
  assert.equal(buildSale(s).sii, null);
});

test("getSale: 404 → null; forma inválida → 502", async (t) => {
  const f = t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ error: true, message: "NOT_FOUND", data: null }), { status: 404 }));
  assert.equal(await getSale("jwt", "u1"), null);
  f.mock.mockImplementation(async () => new Response(JSON.stringify({ error: false, message: null, data: { uuid: "u1" } }), { status: 200 }));
  await assert.rejects(getSale("jwt", "u1"), { status: 502 });
});

test("getSale: corta la espera con un plazo", async (t) => {
  t.mock.method(globalThis, "fetch", (_u: unknown, init: RequestInit) => new Promise((_, rej) => init.signal?.addEventListener("abort", () => rej(init.signal!.reason))));
  await assert.rejects(getSale("jwt", "u1", 20), { status: 0 });
});

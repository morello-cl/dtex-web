import assert from "node:assert/strict";
import test from "node:test";
import { buildCards, buildTips, getSalesCards, type SalesCards } from "./cards.ts";
import type { Dashboard } from "./sales.ts";

const p = (amount: number, count = 1) => ({ amount, count });
const base: SalesCards = {
  from: "2026-11-09",
  to: "2026-11-15",
  by_type: [{ type: "debit", ...p(600) }, { type: "credit", ...p(300) }, { type: "prepaid", ...p(100) }],
  by_brand: [{ brand: "Visa", ...p(700) }, { brand: "Mastercard", ...p(300) }],
  by_issuer: [],
  issuer_pending: p(0, 0),
};

test("tipos ordenados de mayor a menor con su %", () => {
  const v = buildCards(base)!;
  assert.deepEqual(v.types.map((t) => [t.label, t.pct]), [["Débito", 60], ["Crédito", 30], ["Prepago", 10]]);
});

test("sin ventas con tarjeta → null", () => {
  assert.equal(buildCards({ ...base, by_type: [] }), null);
});

test("más de 5 bancos: 5 y 'Otros bancos'; sin dato y pendiente van aparte", () => {
  const v = buildCards({
    ...base,
    by_issuer: [
      { issuer: "Banco Estado", ...p(400) }, { issuer: "Bci", ...p(200) }, { issuer: "Santander", ...p(100) },
      { issuer: "Chile", ...p(90) }, { issuer: "Itaú", ...p(80) }, { issuer: "Falabella", ...p(70) },
      { issuer: "Ripley", ...p(60) }, { issuer: null, ...p(500) },
    ],
    issuer_pending: p(1200, 3),
  })!;
  assert.deepEqual(v.issuers.map((i) => i.label), ["Banco Estado", "Bci", "Santander", "Chile", "Itaú", "Otros bancos"]);
  assert.equal(v.issuers.find((i) => i.key === "otros")!.amount, 130);
  assert.match(v.pending!, /\$1\.200 aún sin banco/);
  assert.match(v.unknown!, /\$500/);
});

function dash(over: Partial<Dashboard["kpis"]> = {}, amounts = [100, 100, 100, 100, 100, 100, 30]): Dashboard {
  return {
    compareLabel: "Semana anterior",
    days: amounts.map((current, i) => ({ date: `día ${i}`, current, isToday: i === amounts.length - 1 })),
    kpis: { ticketDelta: 0, peakHour: null, ...over },
  } as unknown as Dashboard;
}

test("consejos: banco dominante, día flojo, ticket en baja y hora punta; máximo 3", () => {
  const cards = buildCards({ ...base, by_issuer: [{ issuer: "Bci", ...p(60) }, { issuer: "Chile", ...p(40) }] });
  const t = buildTips(dash({ ticketDelta: -15, peakHour: "13 a 14 h" }, [100, 100, 50, 100, 100, 100, 5]), cards);
  assert.deepEqual(t.map((x) => x.key), ["bank", "weak", "ticket"]);
  assert.match(t[0].text, /60% .* Bci/);
  assert.match(t[1].text, /día 2 vendiste 45% menos/);
});

test("consejos: hoy a medias no es el día flojo y sin señales no hay consejos", () => {
  assert.deepEqual(buildTips(dash(), null), []);
});

test("consejos: hora punta en palabras", () => {
  assert.match(buildTips(dash({ peakHour: "13 a 14 h" }), null)[0].text, /entre las 13 y las 14 h/);
});

test("getSalesCards rechaza una forma inválida", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ error: false, message: null, data: { ...base, by_type: [{ type: "gift", ...p(1) }] } }), { status: 200 }));
  await assert.rejects(getSalesCards("jwt", "2026-11-09", "2026-11-15"), { status: 502 });
});

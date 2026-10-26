import assert from "node:assert/strict";
import test from "node:test";
import { servicePaymentAmounts } from "./pay-services-money.ts";

test("calcula 6% más IVA para una carga de $20.000", () => {
  assert.deepEqual(servicePaymentAmounts(20_000), {
    amount: 20_000,
    serviceFee: 1_428,
    total: 21_428,
  });
});

test("rechaza montos que no sean pesos enteros positivos", () => {
  assert.throws(() => servicePaymentAmounts(0), /entero positivo/);
  assert.throws(() => servicePaymentAmounts(1.5), /entero positivo/);
});

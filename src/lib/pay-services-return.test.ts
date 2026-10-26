import assert from "node:assert/strict";
import test from "node:test";
import { paymentReturnState } from "./pay-services-return.ts";

test("el retorno de Mercado Pago nunca confirma un pago por sí solo", () => {
  assert.equal(paymentReturnState("ready", "success"), "unconfirmed");
  assert.equal(paymentReturnState("paid", "failure"), "paid");
  assert.equal(paymentReturnState("processing", "success"), "processing");
});

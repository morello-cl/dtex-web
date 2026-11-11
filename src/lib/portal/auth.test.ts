import assert from "node:assert/strict";
import test from "node:test";
import {
  errorMessage,
  getMe,
  isServiceDown,
  login,
  passwordError,
  requestLink,
  setPassword,
} from "./auth.ts";

function reply(status: number, data: unknown, message: string | null = null) {
  return async () =>
    new Response(JSON.stringify({ error: status >= 400, message, data }), {
      status,
    });
}

async function caught(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (e) {
    return e;
  }
  assert.fail("se esperaba un error");
}

test("normaliza el correo antes de enviarlo", async (t) => {
  const f = t.mock.method(globalThis, "fetch", reply(200, { sent: true }));
  await requestLink("  Ventas@Mufin.CL ");
  const init = f.mock.calls[0].arguments[1] as RequestInit;
  assert.deepEqual(JSON.parse(init.body as string), { email: "ventas@mufin.cl" });
});

test("passwordError: largo en bytes", () => {
  const msg = "La contraseña debe tener entre 10 y 72 caracteres.";
  assert.equal(passwordError("123456789"), msg);
  assert.equal(passwordError("1234567890"), null);
  assert.equal(passwordError("ñ".repeat(37)), msg); // 74 bytes
});

test("login 401 → mensaje de credenciales", async (t) => {
  t.mock.method(globalThis, "fetch", reply(401, null, "INVALID_CREDENTIALS"));
  const e = await caught(login("a@b.cl", "1234567890"));
  assert.equal(errorMessage(e), "Correo o contraseña incorrectos.");
  assert.equal(isServiceDown(e), false);
});

test("login 423 → minutos de espera redondeados hacia arriba", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    reply(423, { retry_after_seconds: 61 }, "ACCOUNT_LOCKED"),
  );
  const e = await caught(login("a@b.cl", "1234567890"));
  assert.equal(
    errorMessage(e),
    "Demasiados intentos. Vuelve a intentar en 2 minutos.",
  );
});

test("set_password 410 → enlace vencido", async (t) => {
  t.mock.method(globalThis, "fetch", reply(410, null, "TOKEN_INVALID"));
  const e = await caught(setPassword("tok", "1234567890"));
  assert.equal(errorMessage(e), "Este enlace ya se usó o venció. Pide uno nuevo.");
  assert.equal(isServiceDown(e), false);
});

test("request_link 429", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    reply(429, { retry_after_seconds: 30 }, "RATE_LIMITED"),
  );
  const e = await caught(requestLink("a@b.cl"));
  assert.equal(
    errorMessage(e),
    "Ya te enviamos un enlace hace poco. Espera unos minutos antes de pedir otro.",
  );
  assert.equal(isServiceDown(e), false);
});

test("fetch que lanza, respuesta no JSON o 503 → isServiceDown", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("fetch failed");
  });
  assert.equal(isServiceDown(await caught(requestLink("a@b.cl"))), true);
  t.mock.restoreAll();

  t.mock.method(globalThis, "fetch", async () => new Response("<html>", { status: 200 }));
  assert.equal(isServiceDown(await caught(requestLink("a@b.cl"))), true);
  t.mock.restoreAll();

  t.mock.method(globalThis, "fetch", reply(503, null, "HUB_NO_DISPONIBLE"));
  assert.equal(isServiceDown(await caught(requestLink("a@b.cl"))), true);
});

test("getMe devuelve null con 401 y envía x-token-dtex", async (t) => {
  const f = t.mock.method(globalThis, "fetch", reply(401, null, "UNAUTHORIZED"));
  assert.equal(await getMe("jwt-1"), null);
  const init = f.mock.calls[0].arguments[1] as RequestInit;
  assert.equal((init.headers as Record<string, string>)["x-token-dtex"], "jwt-1");
});

test("login devuelve { token, expiresIn } desde { token, expires_in }", async (t) => {
  t.mock.method(globalThis, "fetch", reply(200, { token: "jwt", expires_in: 43200 }));
  assert.deepEqual(await login("a@b.cl", "1234567890"), {
    token: "jwt",
    expiresIn: 43200,
  });
});

test("éxito con forma inválida → isServiceDown (no cookie undefined ni 500)", async (t) => {
  t.mock.method(globalThis, "fetch", reply(200, {}));
  assert.equal(isServiceDown(await caught(login("a@b.cl", "1234567890"))), true);
  t.mock.restoreAll();

  t.mock.method(globalThis, "fetch", reply(200, { user: {} }));
  assert.equal(isServiceDown(await caught(getMe("jwt"))), true);
});

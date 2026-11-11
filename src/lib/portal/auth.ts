// Cliente de auth del portal contra tomahawk (contrato: docs/portal/contratos.md).
// Sin imports de next/* para poder probarlo con node --test.

type Envelope<T> = { error: boolean; message: string | null; data: T | null };

export class PortalApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(code: string, status: number, retryAfterSeconds?: number) {
    super(code);
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export type Session = { token: string; expiresIn: number };

export type Me = {
  user: { uuid: string; email: string; role: "admin" };
  merchant: { uuid: string; name: string };
};

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function passwordError(pw: string): string | null {
  // Bytes y no caracteres: bcrypt trunca sobre 72 bytes.
  const bytes = new TextEncoder().encode(pw).length;
  return bytes >= 10 && bytes <= 72
    ? null
    : "La contraseña debe tener entre 10 y 72 caracteres.";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = process.env.TOMAHAWK_BASE_URL ?? "https://api.dtex.app";
  let response: Response;
  try {
    response = await fetch(new URL(path, base), {
      ...init,
      cache: "no-store",
      headers: {
        accept: "application/json",
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new PortalApiError("NETWORK", 0);
  }

  let body: Envelope<T> | null = null;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    // Respuesta no JSON (proxy caído, HTML de error): se trata como servicio caído.
  }
  if (!body) throw new PortalApiError("NETWORK", response.status);

  if (!response.ok || body.error || body.data === null) {
    const retry = (body.data as { retry_after_seconds?: unknown } | null)
      ?.retry_after_seconds;
    throw new PortalApiError(
      body.message || "UNKNOWN",
      response.status,
      typeof retry === "number" ? retry : undefined,
    );
  }
  return body.data;
}

function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(payload) });
}

function toSession(d: { token: string; expires_in: number }): Session {
  return { token: d.token, expiresIn: d.expires_in };
}

export async function login(email: string, password: string): Promise<Session> {
  return toSession(
    await post("/api/portal/auth/v1/login", {
      email: normalizeEmail(email),
      password,
    }),
  );
}

export async function requestLink(email: string): Promise<void> {
  await post("/api/portal/auth/v1/request_link", { email: normalizeEmail(email) });
}

export async function setPassword(token: string, password: string): Promise<Session> {
  return toSession(await post("/api/portal/auth/v1/set_password", { token, password }));
}

export async function getMe(jwt: string): Promise<Me | null> {
  try {
    return await request<Me>("/api/portal/v1/me", {
      headers: { "x-token-dtex": jwt },
    });
  } catch (e) {
    if (e instanceof PortalApiError && e.status === 401) return null;
    throw e;
  }
}

export function isServiceDown(e: unknown): boolean {
  if (!(e instanceof PortalApiError)) return true;
  return e.status === 0 || e.code === "NETWORK" || e.status >= 500;
}

export function errorMessage(e: unknown): string {
  const code = e instanceof PortalApiError ? e.code : "";
  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Correo o contraseña incorrectos.";
    case "ACCOUNT_LOCKED": {
      const min = Math.max(1, Math.ceil(((e as PortalApiError).retryAfterSeconds ?? 60) / 60));
      return `Demasiados intentos. Vuelve a intentar en ${min} ${min === 1 ? "minuto" : "minutos"}.`;
    }
    case "TOKEN_INVALID":
      return "Este enlace ya se usó o venció. Pide uno nuevo.";
    case "RATE_LIMITED":
      return "Ya te enviamos un enlace hace poco. Espera unos minutos antes de pedir otro.";
    case "WEAK_PASSWORD":
      return "La contraseña debe tener entre 10 y 72 caracteres.";
    default:
      return "No pudimos completar la operación. Intenta de nuevo.";
  }
}

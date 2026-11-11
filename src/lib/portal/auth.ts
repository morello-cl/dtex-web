// Cliente de auth del portal contra tomahawk (contrato: docs/portal/contratos.md).
// Sin imports de next/* para poder probarlo con node --test.

type Envelope<T> = { error: boolean; message: string | null; data: T | null };

export class PortalApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryAfterSeconds?: number;
  readonly reason?: string;

  constructor(code: string, status: number, data?: unknown) {
    super(code);
    this.code = code;
    this.status = status;
    const d = (data ?? {}) as { retry_after_seconds?: unknown; reason?: unknown };
    if (typeof d.retry_after_seconds === "number") this.retryAfterSeconds = d.retry_after_seconds;
    if (typeof d.reason === "string") this.reason = d.reason;
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
    throw new PortalApiError(body.message || "UNKNOWN", response.status, body.data);
  }
  return body.data;
}

function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(payload) });
}

// Un 200 con forma inesperada es un tomahawk roto: se trata como servicio caído.
function malformed(): PortalApiError {
  return new PortalApiError("NETWORK", 502);
}

function toSession(d: { token?: unknown; expires_in?: unknown }): Session {
  if (typeof d.token !== "string" || !d.token || typeof d.expires_in !== "number") {
    throw malformed();
  }
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
  let me: Me;
  try {
    me = await request<Me>("/api/portal/v1/me", {
      headers: { "x-token-dtex": jwt },
    });
  } catch (e) {
    if (e instanceof PortalApiError && e.status === 401) return null;
    throw e;
  }
  if (typeof me.merchant?.name !== "string" || typeof me.user?.email !== "string") {
    throw malformed();
  }
  return me;
}

export type LinkStatus = "valid" | "used" | "expired" | "invalid";

export type LinkProblemKind = Exclude<LinkStatus, "valid">;

// Cada causa tiene su explicación y su salida: "pide otro" no basta.
export const LINK_PROBLEMS: Record<LinkProblemKind, { title: string; body: string }> = {
  used: {
    title: "Este enlace ya fue usado",
    body: "Cada enlace sirve una sola vez, para proteger tu cuenta. Si ya definiste tu contraseña con él, ingresa con tu correo y esa contraseña. Si no recuerdas haberlo usado, pide un enlace nuevo y define otra contraseña.",
  },
  expired: {
    title: "Este enlace venció",
    body: "Por seguridad, cada enlace dura 30 minutos desde que lo enviamos y este ya pasó ese plazo. Pide uno nuevo con el correo de tu empresa y ábrelo apenas te llegue.",
  },
  invalid: {
    title: "Este enlace no es válido",
    body: "Puede que esté incompleto: algunos programas de correo cortan la dirección en dos líneas. Abre el enlace directamente desde el correo o pide uno nuevo.",
  },
};


/** Motivo por el que un enlace no sirve, o null si el error es otro. */
export function linkProblem(e: unknown): LinkProblemKind | null {
  if (!(e instanceof PortalApiError) || e.code !== "TOKEN_INVALID") return null;
  return e.reason === "used" || e.reason === "expired" ? e.reason : "invalid";
}

/** Revisa el enlace sin consumirlo. Lanza si tomahawk está caído. */
export async function checkLink(token: string): Promise<LinkStatus> {
  try {
    await request(`/api/portal/auth/v1/link/${encodeURIComponent(token)}`);
    return "valid";
  } catch (e) {
    const problem = linkProblem(e);
    if (problem) return problem;
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

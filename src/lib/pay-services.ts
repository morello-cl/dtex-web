import "server-only";

export type PayServicesStatus =
  | "ready"
  | "pending"
  | "processing"
  | "paid"
  | "expired"
  | "cancelled";

export type PayServicesIntent = {
  uuid: string;
  status: PayServicesStatus;
  amount: number;
  commerceName: string;
  expiresAt?: string;
};

type Envelope<T> = {
  error: boolean;
  message?: string;
  data: T | null;
};

const STATUSES = new Set<PayServicesStatus>([
  "ready",
  "pending",
  "processing",
  "paid",
  "expired",
  "cancelled",
]);

export class PayServicesApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function isPaymentUuid(value: string): boolean {
  return /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(
    value,
  );
}

function endpoint(uuid: string, suffix = ""): URL {
  const base = process.env.TOMAHAWK_BASE_URL ?? "https://api.dtex.app";
  return new URL(`/api/pay-services/v1/${encodeURIComponent(uuid)}${suffix}`, base);
}

async function request<T>(url: URL, init?: RequestInit): Promise<T> {
  const apiKey = process.env.DTEX_PAYMENTS_API_KEY;
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(init?.method === "POST" ? { "content-type": "application/json" } : {}),
      ...(apiKey ? { "x-api-key": apiKey } : {}),
      ...init?.headers,
    },
  });

  let body: Envelope<T> | null = null;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    // El error seguro se construye abajo sin filtrar la respuesta de Tomahawk.
  }

  if (!response.ok || !body || body.error || body.data === null) {
    throw new PayServicesApiError(
      body?.message || "No fue posible consultar el pago.",
      response.status,
    );
  }

  return body.data;
}

export async function getPayServicesIntent(
  uuid: string,
): Promise<PayServicesIntent> {
  const data = await request<{
    uuid: string;
    status: PayServicesStatus;
    amount: number;
    commerce: { name: string };
    expiresAt?: string;
  }>(endpoint(uuid));

  if (
    typeof data.uuid !== "string" ||
    data.uuid.toLowerCase() !== uuid.toLowerCase() ||
    !STATUSES.has(data.status) ||
    !Number.isSafeInteger(data.amount) ||
    data.amount <= 0 ||
    !data.commerce?.name?.trim()
  ) {
    throw new PayServicesApiError("La intención de pago no es válida.", 502);
  }

  return {
    uuid: data.uuid,
    status: data.status,
    amount: data.amount,
    commerceName: data.commerce.name.trim(),
    expiresAt: data.expiresAt,
  };
}

export async function createPayServicesCheckout(uuid: string): Promise<string> {
  const data = await request<{ url: string }>(endpoint(uuid, "/checkout"), {
    method: "POST",
    body: "{}",
  });

  let checkoutUrl: URL;
  try {
    checkoutUrl = new URL(data.url);
  } catch {
    throw new PayServicesApiError("Tomahawk devolvió una URL de pago inválida.", 502);
  }
  const isMercadoPago =
    checkoutUrl.hostname === "mercadopago.cl" ||
    checkoutUrl.hostname.endsWith(".mercadopago.cl") ||
    checkoutUrl.hostname === "mercadopago.com" ||
    checkoutUrl.hostname.endsWith(".mercadopago.com");
  if (checkoutUrl.protocol !== "https:" || !isMercadoPago) {
    throw new PayServicesApiError("Tomahawk devolvió una URL de pago inválida.", 502);
  }
  return checkoutUrl.toString();
}

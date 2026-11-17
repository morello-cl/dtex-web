// Detalle de una venta (contrato: docs/portal/contratos.md §6). Cálculo de
// presentación como función pura. Sin imports de next/*.
import { PortalApiError, portalRequest } from "./auth.ts";
import { cardLabel } from "./day.ts";
import { formatClp } from "./sales.ts";

type CardType = "credit" | "debit" | "prepaid" | null;
type SiiStatus = "accepted" | "accepted_with_objections" | "rejected" | "sent" | "not_sent";
export type SaleDetail = {
  uuid: string;
  document: {
    type_code: number;
    type_name: string;
    folio: number;
    issued_at: string;
    amounts: { net: number | null; tax: number | null; tax_rate: number | null; exempt: number | null; total: number; tip: number; paid: number | null; change: number };
    receiver: { rut: string; name: string; business_activity: string | null; address: string | null; commune: string | null } | null;
    reference: { type_code: number; folio: number; reason: string | null } | null;
    // null si el documento no es electrónico. Opcional mientras tomahawk no lo publique.
    sii?: { status: SiiStatus; track_id: string | null; sent_at: string | null; message: string | null } | null;
  };
  items: { line: number; code: string | null; description: string; quantity: number; unit: string | null; unit_price: number; discount_pct: number | null; total: number }[];
  payment: {
    method: string;
    acquirer: string | null;
    card: { type: CardType; brand: string | null; last4: string | null; issuer: string | null; foreign: boolean | null } | null;
    authorization_code: string | null;
    installments: number | null;
    transaction_id: string | null;
    paid_at: string | null;
    settlement: { status: "pending" | "settled"; settled_on: string | null } | null;
  } | null;
  equipment: { uuid: string; tid: string };
  cashier_code: string | null;
};

const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const str = (v: unknown) => typeof v === "string";

/** null si la venta no existe o es de otro comercio (404). */
export async function getSale(jwt: string, uuid: string): Promise<SaleDetail | null> {
  let s: SaleDetail;
  try {
    s = await portalRequest<SaleDetail>(`/api/portal/v1/sales/${encodeURIComponent(uuid)}`, { headers: { "x-token-dtex": jwt } });
  } catch (e) {
    if (e instanceof PortalApiError && e.status === 404) return null;
    throw e;
  }
  const d = s.document;
  const ok =
    str(s.uuid) &&
    str(d?.type_name) &&
    num(d.folio) &&
    str(d.issued_at) &&
    num(d.amounts?.total) &&
    Array.isArray(s.items) &&
    s.items.every((i) => str(i.description) && [i.quantity, i.unit_price, i.total].every(num)) &&
    (s.payment === null || str(s.payment?.method)) &&
    str(s.equipment?.tid);
  if (!ok) throw new PortalApiError("NETWORK", 502);
  return s;
}

const ACQUIRERS: Record<string, string> = { kushki: "Kushki", tuu: "TUU", mercadopago: "Mercado Pago", virtualpos: "VirtualPos", compraqui: "Compraquí" };
const dateTime = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeStyle: "short", timeZone: "America/Santiago" });
const day = (iso: string) => new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

// tone: ok (verde), warn (ámbar), wait (neutro). Un rechazo del SII es ámbar: hay que corregir, no es una venta perdida.
const SII: Record<SiiStatus, { label: string; tone: "ok" | "warn" | "wait" }> = {
  accepted: { label: "Aceptado por el SII", tone: "ok" },
  accepted_with_objections: { label: "Aceptado con reparos por el SII", tone: "warn" },
  rejected: { label: "Rechazado por el SII", tone: "warn" },
  sent: { label: "Enviado, esperando respuesta del SII", tone: "wait" },
  not_sent: { label: "Aún no enviado al SII", tone: "wait" },
};

export type SaleView = ReturnType<typeof buildSale>;

export function buildSale(s: SaleDetail) {
  const d = s.document;
  const a = d.amounts;
  const totals: { label: string; value: string; strong?: boolean }[] = [];
  if (a.net !== null) totals.push({ label: "Neto", value: formatClp(a.net) });
  if (a.tax !== null) totals.push({ label: `IVA${a.tax_rate ? ` (${a.tax_rate}%)` : ""}`, value: formatClp(a.tax) });
  if (a.exempt) totals.push({ label: "Exento", value: formatClp(a.exempt) });
  totals.push({ label: "Total del documento", value: formatClp(a.total), strong: true });
  if (a.tip) totals.push({ label: "Propina", value: formatClp(a.tip) });
  if (a.paid !== null && a.paid !== a.total + a.tip) totals.push({ label: "Pagado", value: formatClp(a.paid) });
  if (a.change) totals.push({ label: s.payment?.method === "card" ? "Efectivo entregado" : "Vuelto", value: formatClp(a.change) });

  const p = s.payment;
  const c = p?.card ?? null;
  const payment: { label: string; value: string }[] = [];
  if (p) {
    payment.push({ label: "Medio", value: p.method === "card" ? cardLabel(c && { type: c.type, brand: c.brand, last_four: c.last4 }) : p.method === "cash" ? "Efectivo" : p.method });
    if (c?.issuer) payment.push({ label: "Banco", value: c.foreign ? `${c.issuer} (tarjeta extranjera)` : c.issuer });
    else if (c?.foreign) payment.push({ label: "Banco", value: "Tarjeta extranjera" });
    if (p.installments && p.installments > 1) payment.push({ label: "Cuotas", value: String(p.installments) });
    if (p.authorization_code) payment.push({ label: "Código de autorización", value: p.authorization_code });
    if (p.transaction_id) payment.push({ label: "N° de transacción", value: p.transaction_id });
    if (p.acquirer) payment.push({ label: "Procesado por", value: ACQUIRERS[p.acquirer] ?? p.acquirer });
    if (p.paid_at) payment.push({ label: "Fecha del pago", value: dateTime.format(new Date(p.paid_at)) });
    if (p.settlement)
      payment.push({
        label: "Liquidación",
        value: p.settlement.status === "settled" && p.settlement.settled_on ? `Liquidada el ${day(p.settlement.settled_on)}` : "Pendiente de liquidar",
      });
  }

  const sii = d.sii && SII[d.sii.status] ? {
    ...SII[d.sii.status],
    trackId: d.sii.track_id,
    sentAt: d.sii.sent_at && dateTime.format(new Date(d.sii.sent_at)),
    message: d.sii.message,
  } : null;

  return {
    sii,
    total: formatClp(a.total + a.tip),
    brand: c?.brand ?? null,
    title: `${d.type_name} N° ${d.folio}`,
    issued: dateTime.format(new Date(d.issued_at)),
    receiver: d.receiver,
    reference: d.reference && `Referencia a documento ${d.reference.type_code} N° ${d.reference.folio}${d.reference.reason ? `: ${d.reference.reason}` : ""}`,
    items: s.items.map((i) => ({
      key: i.line,
      description: i.description,
      detail: `${i.quantity.toLocaleString("es-CL")}${i.unit ? ` ${i.unit}` : ""} × ${formatClp(i.unit_price)}${i.discount_pct ? `, ${i.discount_pct}% dcto.` : ""}`,
      total: formatClp(i.total),
    })),
    totals,
    payment,
    place: `Equipo ${s.equipment.tid}${s.cashier_code ? `, cajero ${s.cashier_code}` : ""}`,
  };
}

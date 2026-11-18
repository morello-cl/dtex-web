import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFooter from "@/components/portal/PortalFooter";
import PortalHeader from "@/components/portal/PortalHeader";
import SalePanel from "@/components/portal/SalePanel";
import SalesDay from "@/components/portal/SalesDay";
import { PortalApiError } from "@/lib/portal/auth";
import { badRequestTarget, buildDay, chileToday, getSalesDay, minDate, parseDate, parseMethod, type SalesDayData } from "@/lib/portal/day";
import { buildSale, getSale, type SaleView } from "@/lib/portal/sale";
import { requireMe, SESSION_COOKIE } from "@/lib/portal/session";

export const metadata: Metadata = { title: "Ventas" };

type Params = { fecha?: string | string[]; medio?: string | string[]; cursor?: string | string[]; venta?: string | string[] };

export default async function VentasPage({ searchParams }: { searchParams: Promise<Params> }) {
  const me = await requireMe();
  const p = await searchParams;
  const today = chileToday();
  const date = parseDate(p.fecha, today);
  const method = parseMethod(p.medio);
  const cursor = typeof p.cursor === "string" ? p.cursor : null;
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const venta = typeof p.venta === "string" ? p.venta : null;
  // El detalle es secundario: si falla, la tabla se muestra igual y el panel lo explica.
  const sale = venta
    ? getSale(jwt, venta)
        .then((s) => ({ v: s && buildSale(s), error: s ? null : "No encontramos esta venta." }))
        .catch(() => ({ v: null as SaleView | null, error: "El detalle de la venta no está disponible en este momento. Intenta más tarde." }))
    : null;

  let data: SalesDayData | null = null;
  let status = 0;
  try {
    data = await getSalesDay(jwt, date, method, cursor);
  } catch (e) {
    // Cualquier otro error (caído, 5xx, forma inválida) lleva a mantención.
    status = e instanceof PortalApiError ? e.status : 0;
  }
  if (status === 401) redirect("/portal/ingresar");
  const retry = status === 400 ? badRequestTarget(p, method) : null;
  if (retry) redirect(retry);
  if (!data) redirect("/portal/mantencion");
  const q = new URLSearchParams({ fecha: date });
  if (method) q.set("medio", method);
  if (cursor) q.set("cursor", cursor);
  const self = `/portal/ventas?${q}`;
  const panel = sale && (await sale);

  return (
    <div className="flex flex-1 flex-col bg-mufin-bg">
      <PortalHeader merchant={me.merchant.name} current="/portal/ventas" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="mb-6 truncate text-sm font-medium text-mufin-ink md:hidden">{me.merchant.name}</p>
        <SalesDay d={buildDay(data, method, today)} today={today} min={minDate(today)} paged={cursor !== null} self={self} />
        {panel && <SalePanel v={panel.v} error={panel.error} close={self} />}
      </main>
      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <PortalFooter />
      </div>
    </div>
  );
}

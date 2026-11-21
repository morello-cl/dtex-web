import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFooter from "@/components/portal/PortalFooter";
import PortalHeader from "@/components/portal/PortalHeader";
import SalePanel from "@/components/portal/SalePanel";
import SalesDay from "@/components/portal/SalesDay";
import SalesMonth, { ViewToggle } from "@/components/portal/SalesMonth";
import { PortalApiError } from "@/lib/portal/auth";
import { badRequestTarget, buildDay, chileToday, getSalesDay, minDate, parseDate, parseMethod, type SalesDayData } from "@/lib/portal/day";
import { buildMonth, getSalesMonth, parseSalesMonth } from "@/lib/portal/month";
import { buildSale, getSale, type SaleView } from "@/lib/portal/sale";
import { requireMe, SESSION_COOKIE } from "@/lib/portal/session";

export const metadata: Metadata = { title: "Ventas" };

type Params = { mes?: string | string[]; fecha?: string | string[]; medio?: string | string[]; cursor?: string | string[]; venta?: string | string[] };

export default async function VentasPage({ searchParams }: { searchParams: Promise<Params> }) {
  const me = await requireMe();
  const p = await searchParams;
  const today = chileToday();
  const month = parseSalesMonth(p.mes, today);
  if (month) return <MonthPage merchant={me.merchant.name} month={month} today={today} />;
  if (p.mes) redirect("/portal/ventas?mes=" + today.slice(0, 7));
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

// Vista mensual (§7): ?mes=YYYY-MM. Cada día enlaza a su vista diaria.
async function MonthPage({ merchant, month, today }: { merchant: string; month: string; today: string }) {
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  let v = null;
  let status = 0;
  try {
    v = buildMonth(await getSalesMonth(jwt, month), today);
  } catch (e) {
    status = e instanceof PortalApiError ? e.status : 0;
  }
  if (status === 401) redirect("/portal/ingresar");
  // Un 400 con un mes ya validado: tomahawk no lo acepta; se vuelve al mes actual.
  if (status === 400 && month !== today.slice(0, 7)) redirect(`/portal/ventas?mes=${today.slice(0, 7)}`);
  // ponytail: 404 = tomahawk aún no publica §7; se avisa en vez de mandar a mantención. Borrar cuando esté en producción.
  if (!v && status !== 404) redirect("/portal/mantencion");
  return (
    <div className="flex flex-1 flex-col bg-mufin-bg">
      <PortalHeader merchant={merchant} current="/portal/ventas" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="mb-6 truncate text-sm font-medium text-mufin-ink md:hidden">{merchant}</p>
        {v ? (
          <SalesMonth v={v} today={today} />
        ) : (
          <div className="space-y-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-mufin-ink">Ventas del mes</h1>
              <ViewToggle day={today} month={month} current="month" />
            </header>
            <p className="rounded-2xl border border-mufin-border bg-white p-5 text-sm text-mufin-ink sm:p-6">
              La vista por mes estará disponible muy pronto. Mientras tanto, revisa tus ventas día por día.
            </p>
          </div>
        )}
      </main>
      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <PortalFooter />
      </div>
    </div>
  );
}

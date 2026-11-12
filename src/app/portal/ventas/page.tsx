import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFooter from "@/components/portal/PortalFooter";
import PortalHeader from "@/components/portal/PortalHeader";
import SalesDay from "@/components/portal/SalesDay";
import { PortalApiError } from "@/lib/portal/auth";
import { buildDay, chileToday, getSalesDay, minDate, parseDate, parseMethod, type SalesDayData } from "@/lib/portal/day";
import { requireMe, SESSION_COOKIE } from "@/lib/portal/session";

export const metadata: Metadata = { title: "Ventas" };

type Params = { fecha?: string | string[]; medio?: string | string[]; cursor?: string | string[] };

export default async function VentasPage({ searchParams }: { searchParams: Promise<Params> }) {
  const me = await requireMe();
  const p = await searchParams;
  const today = chileToday();
  const date = parseDate(p.fecha, today);
  const method = parseMethod(p.medio);
  const cursor = typeof p.cursor === "string" ? p.cursor : null;
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value ?? "";

  let data: SalesDayData | null = null;
  let unauthorized = false;
  try {
    data = await getSalesDay(jwt, date, method, cursor);
  } catch (e) {
    // Cualquier otro error (caído, 5xx, forma inválida) lleva a mantención.
    unauthorized = e instanceof PortalApiError && e.status === 401;
  }
  if (unauthorized) redirect("/portal/ingresar");
  if (!data) redirect("/portal/mantencion");

  return (
    <div className="flex flex-1 flex-col bg-mufin-bg">
      <PortalHeader merchant={me.merchant.name} current="/portal/ventas" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="mb-6 truncate text-sm font-medium text-mufin-900 md:hidden">{me.merchant.name}</p>
        <SalesDay d={buildDay(data, method, today)} today={today} min={minDate(today)} />
      </main>
      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <PortalFooter />
      </div>
    </div>
  );
}

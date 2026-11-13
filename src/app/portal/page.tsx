import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "@/components/portal/Dashboard";
import PortalHeader from "@/components/portal/PortalHeader";
import PortalFooter from "@/components/portal/PortalFooter";
import { NextPayout } from "@/components/portal/Payouts";
import { PortalApiError } from "@/lib/portal/auth";
import { chileToday } from "@/lib/portal/day";
import { getPayouts, nextPayout } from "@/lib/portal/payouts";
import { buildDashboard, getSalesSummary, parseCompare, type SalesSummary } from "@/lib/portal/sales";
import { requireMe, SESSION_COOKIE } from "@/lib/portal/session";

// La plantilla de portal/layout no aplica a la página de su mismo segmento.
export const metadata: Metadata = {
  title: { absolute: "Inicio | Portal de pagos MUFIN" },
};

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ vs?: string | string[] }>;
}) {
  const me = await requireMe();
  const vs = parseCompare((await searchParams).vs);
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value ?? "";

  const today = chileToday();
  // El próximo abono es secundario: si falla, el Inicio se muestra igual sin él.
  const payouts = getPayouts(jwt, today, today).catch(() => null);
  let summary: SalesSummary | null = null;
  let unauthorized = false;
  try {
    summary = await getSalesSummary(jwt);
  } catch (e) {
    // Cualquier otro error (caído, 5xx, forma inválida) lleva a mantención.
    unauthorized = e instanceof PortalApiError && e.status === 401;
  }
  if (unauthorized) redirect("/portal/ingresar");
  if (!summary) redirect("/portal/mantencion");
  const p = await payouts;
  const next = p && nextPayout(p, today);

  return (
    <div className="flex flex-1 flex-col bg-mufin-bg">
      <PortalHeader merchant={me.merchant.name} current="/portal" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="mb-6 truncate text-sm font-medium text-mufin-900 md:hidden">{me.merchant.name}</p>
        {next && <NextPayout n={next} />}
        <Dashboard d={buildDashboard(summary, vs)} vs={vs} />
      </main>
      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <PortalFooter />
      </div>
    </div>
  );
}

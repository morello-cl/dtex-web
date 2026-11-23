import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { PayoutList, PayoutPanel } from "@/components/portal/Payouts";
import { PortalApiError } from "@/lib/portal/auth";
import { chileToday } from "@/lib/portal/day";
import { buildPayout, buildPayouts, getPayout, getPayouts, monthRange, parseMonth, type PayoutsData, type PayoutView } from "@/lib/portal/payouts";
import { requireMe, SESSION_COOKIE } from "@/lib/portal/session";

export const metadata: Metadata = { title: "Abonos" };

export default async function AbonosPage({ searchParams }: { searchParams: Promise<{ mes?: string | string[]; abono?: string | string[] }> }) {
  const me = await requireMe();
  const today = chileToday();
  const p = await searchParams;
  const month = parseMonth(p.mes, today);
  const { from, to } = monthRange(month, today);
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  const abono = typeof p.abono === "string" ? p.abono : null;
  // El detalle es secundario: si falla, la lista se muestra igual y el panel lo explica.
  const detail = abono
    ? getPayout(jwt, abono)
        .then((d) => ({ v: buildPayout(d, today) as PayoutView | null, error: null as string | null }))
        .catch((e) => ({
          v: null,
          error: e instanceof PortalApiError && e.status === 404 ? "No encontramos este abono." : "El detalle del abono no está disponible en este momento. Intenta más tarde.",
        }))
    : null;

  let data: PayoutsData | null = null;
  let status = 0;
  try {
    data = await getPayouts(jwt, from, to);
  } catch (e) {
    // Cualquier otro error (caído, 5xx, forma inválida) lleva a mantención.
    status = e instanceof PortalApiError ? e.status : 0;
  }
  if (status === 401) redirect("/portal/ingresar");
  // Un 400 con un mes ya validado: tomahawk no acepta el rango; se vuelve al mes actual.
  if (status === 400 && month !== today.slice(0, 7)) redirect("/portal/abonos");
  if (!data) redirect("/portal/mantencion");
  const self = month === today.slice(0, 7) ? "/portal/abonos" : `/portal/abonos?mes=${month}`;
  const panel = detail && (await detail);

  return (
    <PortalShell merchant={me.merchant.name} current="/portal/abonos">
      <PayoutList v={buildPayouts(data, month, today)} />
      {panel && <PayoutPanel v={panel.v} error={panel.error} close={self} />}
    </PortalShell>
  );
}

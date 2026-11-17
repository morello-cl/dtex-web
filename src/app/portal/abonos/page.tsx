import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PortalFooter from "@/components/portal/PortalFooter";
import PortalHeader from "@/components/portal/PortalHeader";
import { PayoutList } from "@/components/portal/Payouts";
import { PortalApiError } from "@/lib/portal/auth";
import { chileToday } from "@/lib/portal/day";
import { buildPayouts, getPayouts, monthRange, parseMonth, type PayoutsData } from "@/lib/portal/payouts";
import { requireMe, SESSION_COOKIE } from "@/lib/portal/session";

export const metadata: Metadata = { title: "Abonos" };

export default async function AbonosPage({ searchParams }: { searchParams: Promise<{ mes?: string | string[] }> }) {
  const me = await requireMe();
  const today = chileToday();
  const month = parseMonth((await searchParams).mes, today);
  const { from, to } = monthRange(month, today);
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value ?? "";

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

  return (
    <div className="flex flex-1 flex-col bg-mufin-bg">
      <PortalHeader merchant={me.merchant.name} current="/portal/abonos" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="mb-6 truncate text-sm font-medium text-mufin-ink md:hidden">{me.merchant.name}</p>
        <PayoutList v={buildPayouts(data, month, today)} />
      </main>
      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <PortalFooter />
      </div>
    </div>
  );
}

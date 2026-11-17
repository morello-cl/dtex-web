import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import PortalFooter from "@/components/portal/PortalFooter";
import PortalHeader from "@/components/portal/PortalHeader";
import { PayoutDetail } from "@/components/portal/Payouts";
import { PortalApiError } from "@/lib/portal/auth";
import { chileToday } from "@/lib/portal/day";
import { buildPayout, getPayout, type PayoutDetailData } from "@/lib/portal/payouts";
import { requireMe, SESSION_COOKIE } from "@/lib/portal/session";

export const metadata: Metadata = { title: "Detalle del abono" };

export default async function AbonoPage({ params }: { params: Promise<{ uuid: string }> }) {
  const me = await requireMe();
  const { uuid } = await params;
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value ?? "";

  let data: PayoutDetailData | null = null;
  let status = 0;
  try {
    data = await getPayout(jwt, uuid);
  } catch (e) {
    status = e instanceof PortalApiError ? e.status : 0;
  }
  if (status === 401) redirect("/portal/ingresar");
  // Ajeno o inexistente: tomahawk responde 404 igual en ambos casos.
  if (status === 404) notFound();
  if (!data) redirect("/portal/mantencion");

  return (
    <div className="flex flex-1 flex-col bg-mufin-bg">
      <PortalHeader merchant={me.merchant.name} current="/portal/abonos" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="mb-6 truncate text-sm font-medium text-mufin-ink md:hidden">{me.merchant.name}</p>
        <PayoutDetail v={buildPayout(data, chileToday())} />
      </main>
      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <PortalFooter />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { PaymentResult } from "../PaymentResult";

export const metadata: Metadata = {
  title: "Pago no completado",
  robots: { index: false, follow: false },
};

export default async function PayServicesFailurePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <PaymentResult uuid={uuid} returnKind="failure" />;
}

import type { Metadata } from "next";
import { PaymentResult } from "../PaymentResult";

export const metadata: Metadata = {
  title: "Resultado del pago",
  robots: { index: false, follow: false },
};

export default async function PayServicesSuccessPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <PaymentResult uuid={uuid} returnKind="success" />;
}

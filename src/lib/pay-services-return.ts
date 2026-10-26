import type { PayServicesStatus } from "./pay-services";

export type PaymentReturnKind = "success" | "failure";
export type PaymentReturnState = "paid" | "processing" | "unconfirmed" | "failed";

export function paymentReturnState(
  status: PayServicesStatus,
  returnKind: PaymentReturnKind,
): PaymentReturnState {
  if (status === "paid") return "paid";
  if (status === "processing") return "processing";
  return returnKind === "failure" ? "failed" : "unconfirmed";
}

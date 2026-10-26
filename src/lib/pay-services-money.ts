export const SERVICE_FEE_RATE = 0.06;
export const IVA_RATE = 0.19;

export function servicePaymentAmounts(amount: number) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new TypeError("El monto debe ser un entero positivo en CLP.");
  }

  const serviceFee = Math.round(amount * SERVICE_FEE_RATE * (1 + IVA_RATE));
  return { amount, serviceFee, total: amount + serviceFee };
}

export function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

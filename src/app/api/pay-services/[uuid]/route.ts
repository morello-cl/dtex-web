import {
  createPayServicesCheckout,
  isPaymentUuid,
  PayServicesApiError,
} from "@/lib/pay-services";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  if (!isPaymentUuid(uuid)) {
    return Response.json({ error: "El identificador de pago no es válido." }, { status: 400 });
  }

  try {
    const url = await createPayServicesCheckout(uuid);
    return Response.json(
      { url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status = error instanceof PayServicesApiError ? error.status : 502;
    const safeStatus = status >= 400 && status < 500 ? status : 502;
    const message =
      safeStatus === 404
        ? "Este pago no existe o ya no está disponible."
        : safeStatus === 409
          ? "Este pago ya fue procesado o está en curso."
          : "No pudimos iniciar el pago. Inténtalo nuevamente.";
    return Response.json({ error: message }, { status: safeStatus });
  }
}

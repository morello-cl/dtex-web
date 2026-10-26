import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPayServicesIntent,
  isPaymentUuid,
  PayServicesApiError,
  type PayServicesIntent,
} from "@/lib/pay-services";
import {
  formatClp,
  IVA_RATE,
  SERVICE_FEE_RATE,
  servicePaymentAmounts,
} from "@/lib/pay-services-money";
import PayServicesButton from "./PayServicesButton";
import { PaymentShell, StatusCard } from "./PaymentResult";

export const metadata: Metadata = {
  title: "Carga de saldo de servicios",
  description: "Carga saldo DTEx® de forma segura con Mercado Pago.",
  robots: { index: false, follow: false },
};

function PaymentCard({ intent }: { intent: PayServicesIntent }) {
  const { amount, serviceFee, total } = servicePaymentAmounts(intent.amount);
  const feeLabel = `${SERVICE_FEE_RATE * 100}% + IVA (${IVA_RATE * 100}%)`;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-brand-900/8">
      <div className="border-b border-border bg-surface px-6 py-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          Carga de saldo de servicios
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
          Confirma tu carga
        </h1>
        <p className="mt-1 text-sm text-muted">{intent.commerceName}</p>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="rounded-2xl bg-brand-900 px-5 py-6 text-white">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-200">
            Saldo que recibirás
          </p>
          <p className="mt-2 text-4xl font-extrabold tabular-nums tracking-tight">
            {formatClp(amount)}
          </p>
          <p className="mt-2 text-sm text-brand-100">Disponible para pagos de cuentas y recargas.</p>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Carga de saldo</dt>
            <dd className="font-semibold tabular-nums text-foreground">{formatClp(amount)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Costo de pago online ({feeLabel})</dt>
            <dd className="font-semibold tabular-nums text-foreground">{formatClp(serviceFee)}</dd>
          </div>
          <div className="border-t border-dashed border-border pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-bold text-brand-900">Total a pagar</dt>
              <dd className="text-2xl font-extrabold tabular-nums tracking-tight text-brand-900">
                {formatClp(total)}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-7 rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 8h.01M11 12h1v5h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <div>
              <h2 className="font-bold text-brand-900">¿Por qué necesitas prepagar?</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-800/80">
                Este saldo respalda los pagos de cuentas y recargas que procesas. Por ejemplo, al
                cargar <strong>{formatClp(amount)}</strong> puedes aceptar hasta ese mismo monto en
                servicios. El dinero que tu cliente paga en efectivo o con tarjeta queda en tu
                comercio, mientras DTEx® usa este saldo para liquidar el servicio.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <PayServicesButton uuid={intent.uuid} />
        </div>

        <div className="mt-2 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted">
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>Pago procesado de forma segura por Mercado Pago. DTEx® no almacena los datos de tu tarjeta.</p>
        </div>
      </div>
    </div>
  );
}

export default async function PayServicesPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  if (!isPaymentUuid(uuid)) notFound();

  let intent: PayServicesIntent;
  try {
    intent = await getPayServicesIntent(uuid);
  } catch (error) {
    if (error instanceof PayServicesApiError && error.status === 404) notFound();
    if (error instanceof PayServicesApiError && error.status === 410) {
      return (
        <PaymentShell>
          <StatusCard
            tone="muted"
            title="Este pago ya no está disponible"
            description="Solicita una nueva carga de saldo desde tu equipo DTEx®."
          />
        </PaymentShell>
      );
    }
    return (
      <PaymentShell>
        <StatusCard
          tone="muted"
          title="No pudimos cargar este pago"
          description="El servicio está temporalmente indisponible. Inténtalo nuevamente en unos minutos."
        />
      </PaymentShell>
    );
  }

  let content;
  if (intent.status === "paid") {
    content = (
      <StatusCard
        tone="success"
        title="¡Saldo cargado correctamente!"
        description={`${formatClp(intent.amount)} ya fueron acreditados al saldo de servicios de ${intent.commerceName}.`}
      />
    );
  } else if (intent.status === "processing") {
    content = (
      <StatusCard
        tone="pending"
        title="Estamos confirmando tu pago"
        description="Mercado Pago está procesando la transacción. No necesitas volver a pagar; actualiza esta página en unos minutos."
      />
    );
  } else if (intent.status === "expired" || intent.status === "cancelled") {
    content = (
      <StatusCard
        tone="muted"
        title="Este pago ya no está disponible"
        description="Solicita una nueva carga de saldo desde tu equipo DTEx®."
      />
    );
  } else {
    content = <PaymentCard intent={intent} />;
  }

  return <PaymentShell>{content}</PaymentShell>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import TechnologyByMufin from "@/components/TechnologyByMufin";
import {
  getPayServicesIntent,
  isPaymentUuid,
  PayServicesApiError,
  type PayServicesIntent,
} from "@/lib/pay-services";
import {
  paymentReturnState,
  type PaymentReturnKind,
} from "@/lib/pay-services-return";
import { formatClp } from "@/lib/pay-services-money";

type StatusTone = "success" | "failure" | "pending" | "muted";

export function StatusCard({
  title,
  description,
  tone,
  actionHref = "/",
  actionLabel = "Volver a dtex.cl",
  details = [],
}: {
  title: string;
  description: string;
  tone: StatusTone;
  actionHref?: string;
  actionLabel?: string;
  details?: string[];
}) {
  const toneClasses = {
    success: {
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      label: "text-emerald-700",
    },
    failure: {
      icon: "bg-red-50 text-red-700 ring-red-100",
      label: "text-red-700",
    },
    pending: {
      icon: "bg-amber-50 text-amber-700 ring-amber-100",
      label: "text-amber-700",
    },
    muted: {
      icon: "bg-brand-50 text-brand-700 ring-brand-100",
      label: "text-brand-700",
    },
  }[tone];

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-brand-900/8">
      <div className="px-6 py-7 text-center sm:px-9 sm:py-9">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ring-8 ${toneClasses.icon}`}>
          {tone === "success" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : tone === "failure" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <p className={`mt-6 text-xs font-bold uppercase tracking-[0.16em] ${toneClasses.label}`}>
          Estado de tu pago
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>

        {details.length > 0 && (
          <div className="mt-7 rounded-2xl border border-brand-100 bg-brand-50/70 p-5 text-left">
            <h2 className="text-sm font-bold text-brand-900">Qué debes saber</h2>
            <ul className="mt-3 space-y-3">
              {details.map((detail) => (
                <li key={detail} className="flex gap-3 text-sm leading-relaxed text-brand-800/85">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href={actionHref}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-700 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand-900/10 transition-colors hover:bg-brand-800"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="flex items-start gap-3 border-t border-border bg-surface px-6 py-4 text-left sm:px-9">
        <svg className="mt-0.5 shrink-0 text-accent-600" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
        </svg>
        <p className="text-xs leading-relaxed text-muted">
          DTEx® verifica el resultado directamente con el sistema de pagos. La página de retorno por sí sola nunca se usa como confirmación de una carga.
        </p>
      </div>
    </section>
  );
}

export function PaymentShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-brand-gradient bg-dotgrid min-h-screen px-5 py-7 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Ir al inicio de DTEx®">
            <Logo height={43} priority />
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden="true" />
            Pago seguro
          </span>
        </div>
        {children}
        <footer className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-brand-100 pt-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} MUFIN SpA · DTEx®</p>
          <TechnologyByMufin height={19} />
        </footer>
      </div>
    </main>
  );
}

export async function PaymentResult({
  uuid,
  returnKind,
}: {
  uuid: string;
  returnKind: PaymentReturnKind;
}) {
  if (!isPaymentUuid(uuid)) notFound();

  let intent: PayServicesIntent;
  try {
    intent = await getPayServicesIntent(uuid);
  } catch (error) {
    if (error instanceof PayServicesApiError && error.status === 404) notFound();
    return (
      <PaymentShell>
        <StatusCard
          tone="muted"
          title="No pudimos consultar el pago"
          description="En este momento no pudimos comunicarnos con el sistema que confirma los pagos. Esto no significa que tu transacción haya sido rechazada."
          details={[
            "Si acabas de pagar, no realices un segundo pago mientras no podamos verificar el primero.",
            "Espera unos minutos y vuelve a consultar el estado desde este mismo enlace.",
            "Tu saldo solo se acredita después de recibir una confirmación segura del pago.",
          ]}
          actionHref={`/pay-services/${encodeURIComponent(uuid)}`}
          actionLabel="Volver al pago"
        />
      </PaymentShell>
    );
  }

  const state = paymentReturnState(intent.status, returnKind);
  const retryHref = `/pay-services/${encodeURIComponent(uuid)}`;

  if (state === "paid") {
    return (
      <PaymentShell>
        <StatusCard
          tone="success"
          title="¡Saldo cargado correctamente!"
          description={`${formatClp(intent.amount)} ya fueron acreditados al saldo de servicios de ${intent.commerceName}.`}
          details={[
            "El saldo ya está disponible para procesar pagos de cuentas y recargas.",
            `La carga acreditada corresponde a ${formatClp(intent.amount)}; el costo del pago online no descuenta saldo de servicios.`,
            "No necesitas realizar ninguna otra acción. Puedes continuar operando normalmente desde tu equipo DTEx®.",
          ]}
        />
      </PaymentShell>
    );
  }

  if (state === "processing") {
    return (
      <PaymentShell>
        <StatusCard
          tone="pending"
          title="Estamos confirmando tu pago"
          description="Mercado Pago recibió la transacción y estamos esperando su confirmación final antes de acreditar el saldo en DTEx®."
          details={[
            "La validación normalmente tarda solo unos minutos.",
            "No realices un segundo pago mientras la transacción aparezca en proceso.",
            "Cuando recibamos la confirmación, el saldo se acreditará por el monto completo de la carga.",
          ]}
          actionHref={retryHref}
          actionLabel="Revisar estado"
        />
      </PaymentShell>
    );
  }

  if (state === "failed") {
    return (
      <PaymentShell>
        <StatusCard
          tone="failure"
          title="El pago no se completó"
          description="No recibimos una confirmación de pago aprobado y, por lo tanto, no acreditamos saldo de servicios en DTEx®."
          details={[
            "Tu solicitud de carga continúa disponible y puedes volver a intentarlo de forma segura.",
            "Antes de reintentar, comprueba que Mercado Pago no muestre un cobro aprobado para esta operación.",
            "Si ves un cobro o un pago pendiente, espera unos minutos y usa la opción “Revisar estado” para evitar duplicarlo.",
          ]}
          actionHref={retryHref}
          actionLabel="Intentar nuevamente"
        />
      </PaymentShell>
    );
  }

  return (
    <PaymentShell>
      <StatusCard
        tone="pending"
        title="Aún no confirmamos tu pago"
        description="Volviste desde Mercado Pago correctamente, pero todavía no recibimos la confirmación segura necesaria para acreditar tu saldo."
        details={[
          "Regresar a esta página no significa por sí solo que el pago haya sido aprobado.",
          "Estamos esperando la validación oficial de la transacción para proteger tu carga de saldo.",
          "No intentes pagar nuevamente por ahora; espera unos minutos y revisa el estado.",
        ]}
        actionHref={retryHref}
        actionLabel="Revisar estado"
      />
    </PaymentShell>
  );
}

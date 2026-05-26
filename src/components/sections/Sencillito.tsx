import Reveal from "../Reveal";
import SencillitoLogo from "../SencillitoLogo";
import { whatsappLink } from "@/lib/site";

const SERVICES = [
  { label: "Luz", icon: "⚡" },
  { label: "Agua", icon: "💧" },
  { label: "Gas", icon: "🔥" },
  { label: "Internet", icon: "📶" },
  { label: "Recargas", icon: "📱" },
  { label: "Educación", icon: "🎓" },
];

export default function Sencillito() {
  return (
    <section
      id="sencillito"
      className="relative overflow-hidden bg-brand-900 text-white"
    >
      {/* Glow púrpura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-2 md:items-center">
        <Reveal>
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Operado por
            </span>
            <SencillitoLogo height={22} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Haz que más personas entren a tu negocio ofreciendo pagos y
            servicios.
          </h2>
          <p className="mt-5 max-w-lg text-base text-white/75 sm:text-lg">
            Activa Punto Sencillito® en tu comercio y suma una nueva fuente de
            ingresos. Cada pago atrae clientes que también compran.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
            {SERVICES.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-sm backdrop-blur"
              >
                <div className="text-xl">{s.icon}</div>
                <div className="mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a
              href={whatsappLink("sencillito")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/30 transition-all hover:-translate-y-0.5 hover:bg-accent-600"
            >
              Activar Punto Sencillito®
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <PaymentScreen />
        </Reveal>
      </div>
    </section>
  );
}

function PaymentScreen() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Pago de cuentas</span>
          <span>9:41</span>
        </div>
        <h3 className="mt-3 text-xl font-bold">Cuenta de luz</h3>
        <p className="text-sm text-white/60">CGE · Vence en 4 días</p>

        <div className="mt-5 rounded-2xl bg-white/5 p-4">
          <div className="text-xs text-white/60">Total a pagar</div>
          <div className="mt-1 text-3xl font-extrabold">
            $32.480
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/60">
            <span>Cliente</span>
            <span className="text-white">María S.</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-full bg-accent-500 py-3 text-sm font-semibold text-white"
        >
          Confirmar pago
        </button>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
          <span>Comisión comercio</span>
          <span className="text-accent-500 font-semibold">+ $480</span>
        </div>
      </div>

      {/* Tarjeta flotante de "cliente nuevo" */}
      <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-white/10 bg-brand-700/80 px-4 py-3 text-xs shadow-xl backdrop-blur sm:block">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-700 font-bold">
            +1
          </span>
          <div>
            <div className="font-semibold">Nuevo cliente en tu tienda</div>
            <div className="text-white/60">Vino a pagar la luz · gastó $4.200</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import Reveal from "../Reveal";
import PosDevice from "../PosDevice";
import SencillitoLogo from "../SencillitoLogo";
import { whatsappLink } from "@/lib/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="bg-brand-gradient relative overflow-hidden"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 md:grid-cols-2 md:gap-12 md:pb-24 md:pt-16">
        <Reveal className="order-2 md:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur">
            Operado por
            <SencillitoLogo height={16} className="translate-y-[1px]" />
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Convierte tu negocio en un{" "}
            <span className="text-brand-gradient">
              Punto Sencillito<span className="align-super text-[0.5em]">®</span>
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            Acepta pagos con tarjeta, emite boletas electrónicas, cobra cuentas
            y recargas desde un solo equipo Android.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink("info")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-xl"
            >
              Quiero más información
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href={whatsappLink("quote")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition-all hover:border-brand-400 hover:text-brand-800"
            >
              Cotizar equipo
            </a>
          </div>

          <p className="mt-4 text-xs text-muted">
            Al solicitar información aceptas nuestra{" "}
            <Link
              href="/privacidad"
              className="underline decoration-brand-200 underline-offset-2 hover:text-brand-700 hover:decoration-brand-400"
            >
              Política de Privacidad
            </Link>
            .
          </p>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-muted">
            <li className="flex items-center gap-1.5">
              <Check /> Tarjeta crédito y débito
            </li>
            <li className="flex items-center gap-1.5">
              <Check /> Boleta y factura electrónica
            </li>
            <li className="flex items-center gap-1.5">
              <Check /> Pagos y recargas
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120} className="order-1 md:order-2 flex justify-center md:justify-end">
          <div className="w-full max-w-[320px] sm:max-w-[360px]">
            <PosDevice />
          </div>
        </Reveal>
      </div>

      {/* divisor suave */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--brand-50)" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="var(--brand-600)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

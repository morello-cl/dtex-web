import Link from "next/link";
import Reveal from "../Reveal";
import AppCobro from "../AppCobro";
import SencillitoLogo from "../SencillitoLogo";
import { whatsappLink } from "@/lib/site";

// El titular dice qué es DTEx®. MUFIN ya está en el logo del menú y Sencillito®
// va como dato bajo el equipo: tres marcas compitiendo arriba confundían.
export default function Hero() {
  return (
    <section id="top" className="bg-brand-gradient relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-16">
        <Reveal>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Convierte tu negocio en un punto de pagos y servicios.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            Cobra con tarjeta, emite boletas electrónicas y ofrece pago de
            cuentas y recargas desde un solo equipo Android.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink("info")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-colors hover:bg-brand-800"
            >
              Quiero más información
            </a>
            <a
              href={whatsappLink("quote")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400"
            >
              Cotizar equipo
            </a>
          </div>
          <p className="mt-4 text-xs text-muted">
            Al solicitar información aceptas nuestra{" "}
            <Link href="/privacidad" className="underline decoration-brand-200 underline-offset-2 hover:text-brand-700">
              Política de Privacidad
            </Link>
            .
          </p>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            <li className="flex items-center gap-2"><Check /> Boletas y facturas válidas ante el SII</li>
            <li className="flex items-center gap-2"><Check /> Equipo portátil con 4G</li>
            <li className="flex items-center gap-2"><Check /> Punto Sencillito® integrado</li>
          </ul>
        </Reveal>

        <Reveal delay={120} className="flex flex-col items-center gap-5">
          <AppCobro />
          <p className="inline-flex items-center gap-2 text-xs text-muted">
            Pagos y recargas operados por <SencillitoLogo height={16} className="translate-y-[1px]" />
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="var(--brand-700)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

import Reveal from "../Reveal";
import SencillitoLogo from "../SencillitoLogo";
import { whatsappLink } from "@/lib/site";

// El brief pide que esta sección "se vea MUY importante": es el único bloque
// oscuro de la portada. Sin montos, comisiones ni clientes de ejemplo: no hay
// cifras reales que mostrar, así que se muestra qué puede pagar la gente.
const SERVICES: { label: string; detail: string; icon: string }[] = [
  { label: "Luz", detail: "Cuentas de electricidad", icon: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z" },
  { label: "Agua", detail: "Cuentas de agua potable", icon: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" },
  { label: "Gas", detail: "Gas de red", icon: "M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-5 0 2 1 3 2 3 0-3 1-5 1-8Z" },
  { label: "Internet y TV", detail: "Planes del hogar", icon: "M4 6h16v10H4zM9 20h6" },
  { label: "Recargas", detail: "Celulares prepago", icon: "M8 2h8v20H8zM11 18h2" },
  { label: "Educación", detail: "Aranceles y matrículas", icon: "M3 9l9-5 9 5-9 5-9-5Zm4 2.5V16c3 2 7 2 10 0v-4.5" },
];

export default function Sencillito() {
  return (
    <section id="sencillito" className="relative overflow-hidden bg-brand-900 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-brand-700/40 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-2 md:items-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground">
            Operado por <SencillitoLogo height={20} />
          </p>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Haz que más personas entren a tu negocio.
          </h2>
          <p className="mt-5 max-w-lg text-base text-white/80 sm:text-lg">
            Con Punto Sencillito® tus clientes pagan sus cuentas y recargas en
            tu local. Cada visita es una oportunidad de venta.
          </p>
          <a
            href={whatsappLink("sencillito")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            Activar Punto Sencillito®
          </a>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl bg-white p-6 text-foreground shadow-2xl sm:p-8">
            <h3 className="text-lg font-bold">Lo que tus clientes pueden pagar</h3>
            <ul className="mt-5 divide-y divide-border">
              {SERVICES.map((s) => (
                <li key={s.label} className="flex items-center gap-4 py-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={s.icon} />
                    </svg>
                  </span>
                  <span>
                    <span className="block font-semibold">{s.label}</span>
                    <span className="block text-sm text-muted">{s.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

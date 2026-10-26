import Reveal from "../Reveal";
import type { ReactNode } from "react";

type Benefit = {
  title: string;
  desc: string;
  icon: ReactNode;
};

// 6 tarjetas, no 9: boleta+factura, cuentas+recargas y turnos+reportes son
// pares que el comercio percibe como una sola cosa. Menos ítems del mismo peso
// = jerarquía real, que es lo que pide el brief ("minimalista, mucho espacio").
const BENEFITS: Benefit[] = [
  {
    title: "Pago con tarjeta",
    desc: "Acepta crédito, débito y prepago al instante.",
    icon: <IconCard />,
  },
  {
    title: "Boleta y factura electrónica",
    desc: "Emite y envía documentos al SII desde el mismo equipo.",
    icon: <IconReceipt />,
  },
  {
    title: "Cuentas y recargas",
    desc: "Luz, agua, gas y recargas móviles, operado por Sencillito®.",
    icon: <IconBill />,
  },
  {
    title: "Turnos y reportes",
    desc: "Cuadra cajas, cierra turnos y mira tus ventas del día.",
    icon: <IconShift />,
  },
  {
    title: "Múltiples cajas",
    desc: "Opera varios puntos con un solo sistema.",
    icon: <IconMulti />,
  },
  {
    title: "POS Android portátil",
    desc: "Liviano, con batería y conexión 4G/WiFi.",
    icon: <IconPos />,
  },
];

export default function Beneficios() {
  return (
    <section id="beneficios" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Todo en un solo equipo
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pagos, boletas y servicios. Sin vueltas.
            </h2>
            <p className="mt-4 text-base text-muted">
              Cada función pensada para que tu comercio venda más y gestione
              mejor desde el primer día.
            </p>
          </div>
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} as="li" delay={i * 40}>
              <div className="group h-full rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_20px_40px_-20px_rgba(63,24,128,0.35)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
                  {b.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {b.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted">{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <div className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <IconGlobe />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold tracking-tight">
                  Disponible en múltiples idiomas
                </h3>
                <p className="mt-1.5 text-sm text-muted">
                  Tu equipo puede operar en español, portugués, inglés y
                  chino (中文).
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  <LangBadge>Español</LangBadge>
                  <LangBadge>Português</LangBadge>
                  <LangBadge>English</LangBadge>
                  <LangBadge>中文</LangBadge>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LangBadge({ children }: { children: ReactNode }) {
  return (
    <li className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
      {children}
    </li>
  );
}

/* --- Íconos minimalistas (stroke 1.8, currentColor) --- */
function IconBase({ children }: { children: ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
function IconCard() {
  return (
    <IconBase>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </IconBase>
  );
}
function IconReceipt() {
  return (
    <IconBase>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </IconBase>
  );
}
function IconBill() {
  return (
    <IconBase>
      <path d="M4 6h16v12H4z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 9v.01M17 15v.01" />
    </IconBase>
  );
}
function IconShift() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}
function IconMulti() {
  return (
    <IconBase>
      <rect x="3" y="4" width="8" height="8" rx="1.5" />
      <rect x="13" y="4" width="8" height="8" rx="1.5" />
      <rect x="3" y="14" width="8" height="6" rx="1.5" />
      <rect x="13" y="14" width="8" height="6" rx="1.5" />
    </IconBase>
  );
}
function IconPos() {
  return (
    <IconBase>
      <rect x="6" y="2.5" width="12" height="16" rx="2" />
      <path d="M9 6h6M9 10h6" />
      <path d="M4 19h16v2H4z" />
    </IconBase>
  );
}
function IconGlobe() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </IconBase>
  );
}

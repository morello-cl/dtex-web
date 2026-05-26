import Reveal from "../Reveal";
import type { ReactNode } from "react";

type Benefit = {
  title: string;
  desc: string;
  icon: ReactNode;
};

const BENEFITS: Benefit[] = [
  {
    title: "Pago con tarjeta",
    desc: "Acepta crédito, débito y prepago al instante.",
    icon: <IconCard />,
  },
  {
    title: "Boleta electrónica",
    desc: "Cumple con el SII desde el mismo equipo.",
    icon: <IconReceipt />,
  },
  {
    title: "Factura electrónica",
    desc: "Emite y envía facturas en segundos.",
    icon: <IconInvoice />,
  },
  {
    title: "Pago de cuentas",
    desc: "Luz, agua, gas y más, operado por Sencillito®.",
    icon: <IconBill />,
  },
  {
    title: "Recargas electrónicas",
    desc: "Todas las compañías móviles desde tu POS.",
    icon: <IconPhone />,
  },
  {
    title: "Cierre de turnos",
    desc: "Cuadra cajas y turnos sin papeleo.",
    icon: <IconShift />,
  },
  {
    title: "Reportes simples",
    desc: "Mira tus ventas del día desde el equipo.",
    icon: <IconChart />,
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
      </div>
    </section>
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
function IconInvoice() {
  return (
    <IconBase>
      <path d="M7 3h8l4 4v14H7Z" />
      <path d="M14 3v4h4M10 12h6M10 16h6" />
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
function IconPhone() {
  return (
    <IconBase>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
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
function IconChart() {
  return (
    <IconBase>
      <path d="M4 19h16" />
      <path d="M7 15v-4M12 15V7M17 15v-2" />
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

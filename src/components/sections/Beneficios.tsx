import Reveal from "../Reveal";
import type { ReactNode } from "react";

type Benefit = {
  title: string;
  desc: string;
  icon: ReactNode;
};

// Seis capacidades, pero no del mismo peso: cobrar con tarjeta es la razón por
// la que el comercio llega, así que ocupa el bloque grande. Pares como
// boleta+factura o cuentas+recargas van fusionados (el brief pide pocas cosas).
const REST: Benefit[] = [
  {
    title: "Boleta y factura electrónica",
    desc: "Emite documentos válidos ante el SII directo desde el equipo.",
    icon: <IconReceipt />,
  },
  {
    title: "Pago de cuentas y recargas",
    desc: "Luz, agua, gas, internet y recargas móviles, operado por Sencillito®.",
    icon: <IconBill />,
  },
  {
    title: "Turnos y cierres de caja",
    desc: "Abre y cierra turnos y cuadra el efectivo con las ventas del día.",
    icon: <IconShift />,
  },
  {
    title: "Varias cajas, un solo negocio",
    desc: "Suma equipos y operadores; cada caja se ve por separado.",
    icon: <IconMulti />,
  },
  {
    title: "Equipo portátil con 4G",
    desc: "Cobra en el mesón, en la vereda o en la mesa, sin depender del wifi.",
    icon: <IconPos />,
  },
];

const card = "h-full rounded-3xl border border-border bg-white p-6 sm:p-7";
const iconBox = "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700";

export default function Beneficios() {
  const [boleta, cuentas, ...rest] = REST;
  return (
    <section id="beneficios" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Todo lo que tu negocio necesita, en un solo equipo.
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted">
            Pensado para almacenes, minimarkets, botillerías y negocios de barrio.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-4 lg:grid-cols-3">
          <Reveal as="li" className="lg:col-span-2 lg:row-span-2">
            <div className={`${card} flex flex-col bg-gradient-to-br from-white to-brand-50`}>
              <span className={iconBox}><IconCard /></span>
              <h3 className="mt-5 text-2xl font-bold tracking-tight">Cobro con tarjeta</h3>
              <p className="mt-2 max-w-md text-muted">
                Acepta crédito, débito y prepago, con chip, banda o sin contacto.
                El pago lo gestiona MUFIN y llega a tu cuenta como abono.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                {["Crédito", "Débito", "Prepago", "Sin contacto"].map((t) => (
                  <li key={t} className="rounded-full border border-brand-200 bg-white px-3 py-1 font-medium text-brand-700">{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          {[boleta, cuentas].map((b, i) => (
            <Reveal as="li" key={b.title} delay={40 + i * 40}>
              <Item b={b} />
            </Reveal>
          ))}
          {rest.map((b, i) => (
            <Reveal as="li" key={b.title} delay={120 + i * 40}>
              <Item b={b} />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={160}>
          <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-surface p-6 sm:flex-row sm:items-center sm:p-7">
            <span className={`${iconBox} bg-white`}><IconGlobe /></span>
            <p className="flex-1 text-sm text-muted">
              <span className="font-semibold text-foreground">En tu idioma.</span>{" "}
              El equipo opera en español, portugués, inglés y chino.
            </p>
            <ul className="flex flex-wrap gap-2">
              <LangBadge>Español</LangBadge>
              <LangBadge>Português</LangBadge>
              <LangBadge>English</LangBadge>
              <LangBadge>中文</LangBadge>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Item({ b }: { b: Benefit }) {
  return (
    <div className={card}>
      <span className={iconBox}>{b.icon}</span>
      <h3 className="mt-5 text-lg font-bold tracking-tight">{b.title}</h3>
      <p className="mt-1.5 text-sm text-muted">{b.desc}</p>
    </div>
  );
}

function LangBadge({ children }: { children: ReactNode }) {
  return (
    <li className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">
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

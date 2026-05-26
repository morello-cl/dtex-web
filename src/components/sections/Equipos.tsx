import Reveal from "../Reveal";
import { whatsappLink } from "@/lib/site";
import {
  AVAILABILITY_LABEL,
  EQUIPOS,
  type Availability,
} from "@/data/equipos";

export default function Equipos() {
  return (
    <section
      id="equipos"
      className="relative bg-surface py-20 sm:py-28"
    >
      <div className="bg-dotgrid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Equipos Android DTEx®
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tecnología real, en tus manos.
            </h2>
            <p className="mt-4 text-base text-muted">
              Equipos modernos con impresora integrada, software DTEx® y
              conexión 4G. Diseñados para el comercio chileno.
            </p>
          </div>
        </Reveal>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {EQUIPOS.map((eq, i) => (
            <Reveal as="li" key={eq.model} delay={i * 80}>
              <article
                className={`flex h-full flex-col rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
                  eq.highlight
                    ? "border-brand-200 bg-white shadow-[0_30px_60px_-30px_rgba(63,24,128,0.35)]"
                    : "border-border bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold tracking-tight">
                    {eq.model}
                  </h3>
                  {eq.badge && (
                    <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-600">
                      {eq.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{eq.tagline}</p>

                <div className="mt-3">
                  <AvailabilityBadge mode={eq.availability} />
                </div>

                <div className="my-6 flex justify-center">
                  <DeviceIllustration variant={i} />
                </div>

                <dl className="mt-auto space-y-2 border-t border-border pt-4 text-sm">
                  {eq.specs.map((s) => (
                    <div key={s.label} className="flex justify-between">
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <a
                  href={whatsappLink("quote")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                    eq.highlight
                      ? "bg-brand-700 text-white hover:bg-brand-800"
                      : "border border-brand-200 text-brand-700 hover:border-brand-400"
                  }`}
                >
                  Cotizar {eq.model}
                </a>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AvailabilityBadge({ mode }: { mode: Availability }) {
  const isRentOnly = mode === "rent-only";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isRentOnly
          ? "bg-brand-50 text-brand-700"
          : "bg-accent-500/10 text-accent-600"
      }`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {isRentOnly ? (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </>
        ) : (
          <>
            <path d="M3 7h13l5 5v9H3z" />
            <path d="M16 7v5h5" />
          </>
        )}
      </svg>
      {AVAILABILITY_LABEL[mode]}
    </span>
  );
}

function DeviceIllustration({ variant }: { variant: number }) {
  // Siluetas SVG inspiradas en la forma real de cada equipo, con la
  // impresora térmica en la parte superior y el ticket saliendo hacia
  // arriba (orientación real en uso por el cajero).
  if (variant === 0) {
    // Kozen P8 Neo — handheld premium con impresora top y pantalla
    // edge-to-edge en la mitad inferior del cuerpo.
    return (
      <svg
        width="120"
        height="200"
        viewBox="0 0 120 200"
        role="img"
        aria-label="Equipo POS Kozen P8 Neo con impresora térmica integrada"
      >
        {/* Ticket saliendo por arriba */}
        <rect x="32" y="0" width="56" height="26" rx="2" fill="#eaf2ff" />
        <rect x="38" y="6" width="44" height="2" rx="1" fill="#9ec1f5" />
        <rect x="38" y="12" width="34" height="2" rx="1" fill="#9ec1f5" />
        <rect x="38" y="18" width="40" height="2" rx="1" fill="#9ec1f5" />

        {/* Cuerpo */}
        <rect x="22" y="22" width="76" height="172" rx="22" fill="#142446" />
        {/* Zona impresora (más oscura, parte superior del cuerpo) */}
        <path
          d="M22 44 H98 V36 Q98 22 84 22 H36 Q22 22 22 36 Z"
          fill="#07112a"
        />
        {/* Ranura de salida del papel */}
        <rect x="34" y="29" width="52" height="3" rx="1.5" fill="#1d2c4d" />

        {/* Pantalla edge-to-edge */}
        <rect x="28" y="52" width="64" height="128" rx="14" fill="url(#kozen-screen)" />
        {/* Botón home / lector huella */}
        <circle cx="60" cy="188" r="2.5" fill="#1d2c4d" />
        {/* Botones laterales */}
        <rect x="98" y="80" width="2" height="14" rx="1" fill="#1d2c4d" />
        <rect x="98" y="100" width="2" height="22" rx="1" fill="#1d2c4d" />

        <defs>
          <linearGradient id="kozen-screen" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#3a6fd6" />
            <stop offset="1" stopColor="#0d2e72" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (variant === 1) {
    // Sunmi P3 — handheld de gama alta con "cabeza" ancha arriba que
    // aloja la impresora térmica, y cuerpo más estrecho debajo con la
    // pantalla y el grip.
    return (
      <svg
        width="130"
        height="200"
        viewBox="0 0 130 200"
        role="img"
        aria-label="Equipo POS Sunmi P3 con grip ergonómico e impresora superior"
      >
        {/* Ticket saliendo por arriba */}
        <rect x="32" y="0" width="66" height="28" rx="2" fill="#eaf2ff" />
        <rect x="40" y="6" width="50" height="2" rx="1" fill="#9ec1f5" />
        <rect x="40" y="12" width="38" height="2" rx="1" fill="#9ec1f5" />
        <rect x="40" y="18" width="46" height="2" rx="1" fill="#9ec1f5" />
        <rect x="40" y="24" width="30" height="2" rx="1" fill="#9ec1f5" />

        {/* Cabeza ancha (impresora) */}
        <rect x="6" y="24" width="118" height="44" rx="10" fill="#07112a" />
        {/* Ranura de salida del papel */}
        <rect x="28" y="32" width="74" height="3" rx="1.5" fill="#1d2c4d" />

        {/* Cuerpo / grip (más estrecho) */}
        <rect x="20" y="60" width="90" height="138" rx="14" fill="#142446" />

        {/* Pantalla */}
        <rect x="26" y="72" width="78" height="100" rx="6" fill="url(#sunmi-p3-screen)" />
        {/* Botón inferior pantalla */}
        <rect x="58" y="178" width="14" height="3" rx="1.5" fill="#1d2c4d" />
        {/* Texturas grip lateral */}
        <rect x="22" y="124" width="3" height="40" rx="1" fill="#1d2c4d" opacity="0.7" />
        <rect x="105" y="124" width="3" height="40" rx="1" fill="#1d2c4d" opacity="0.7" />

        <defs>
          <linearGradient id="sunmi-p3-screen" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#4ddfc4" />
            <stop offset="1" stopColor="#143f95" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  // Sunmi D3 mini — desktop POS con doble pantalla. La impresora va en
  // un marco superior sobre la pantalla principal del cajero; la cinta
  // sale por arriba. La pantalla cliente queda al costado.
  return (
    <svg
      width="180"
      height="200"
      viewBox="0 0 180 200"
      role="img"
      aria-label="Equipo POS Sunmi D3 mini de mesón con doble pantalla cajero y cliente"
    >
      {/* Ticket saliendo por arriba */}
      <rect x="50" y="0" width="60" height="22" rx="2" fill="#eaf2ff" />
      <rect x="58" y="6" width="44" height="2" rx="1" fill="#9ec1f5" />
      <rect x="58" y="12" width="34" height="2" rx="1" fill="#9ec1f5" />

      {/* Cabezal impresora sobre la pantalla principal */}
      <rect x="20" y="20" width="120" height="22" rx="6" fill="#07112a" />
      <rect x="35" y="30" width="90" height="3" rx="1.5" fill="#1d2c4d" />

      {/* Pantalla principal 10.1" */}
      <rect x="20" y="40" width="120" height="110" rx="6" fill="#142446" />
      <rect x="25" y="45" width="110" height="100" rx="3" fill="url(#d3-main)" />

      {/* Soporte central */}
      <rect x="68" y="150" width="24" height="10" fill="#07112a" />

      {/* Base */}
      <rect x="14" y="158" width="152" height="32" rx="6" fill="#07112a" />
      <rect x="14" y="158" width="152" height="5" rx="2" fill="#142446" />

      {/* Pantalla cliente 4" (a la derecha, más baja) */}
      <rect x="148" y="78" width="30" height="56" rx="4" fill="#142446" />
      <rect x="151" y="82" width="24" height="48" rx="2" fill="url(#d3-client)" />
      {/* Soporte cliente */}
      <rect x="156" y="134" width="14" height="24" fill="#07112a" />

      <defs>
        <linearGradient id="d3-main" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1f55bd" />
          <stop offset="1" stopColor="#07204f" />
        </linearGradient>
        <linearGradient id="d3-client" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#4ddfc4" />
          <stop offset="1" stopColor="#143f95" />
        </linearGradient>
      </defs>
    </svg>
  );
}

import Reveal from "../Reveal";

// Placeholders de logos. Reemplazar por SVGs reales de comercios/distribuidores
// cuando el equipo comercial los entregue.
const LOGOS = [
  "Almacén Líder",
  "Minimarket Express",
  "Distribuidora Andes",
  "Comercial Pacífico",
  "Red Sur",
  "Tiendas Norte",
  "Grupo Centro",
  "Botillería Capital",
];

export default function Clientes() {
  const items = [...LOGOS, ...LOGOS]; // duplicado para el marquee infinito

  return (
    <section
      className="border-y border-border bg-white py-16 sm:py-20"
      aria-labelledby="clientes-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <h2
            id="clientes-heading"
            className="text-center text-sm font-semibold uppercase tracking-wider text-muted"
          >
            Comercios y distribuidores que confían en DTEx®
          </h2>
        </Reveal>

        <div
          className="relative mt-10 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <ul className="animate-marquee flex w-max items-center gap-10 sm:gap-14">
            {items.map((name, i) => (
              <li
                key={`${name}-${i}`}
                className="flex shrink-0 items-center gap-3 rounded-xl px-5 py-3 text-muted"
              >
                <LogoMark seed={i} />
                <span className="text-sm font-semibold tracking-tight">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LogoMark({ seed }: { seed: number }) {
  // Pequeñas variaciones de forma para que no todos los placeholders se vean
  // idénticos.
  const variant = seed % 4;
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
      {variant === 0 && (
        <>
          <circle cx="16" cy="16" r="13" fill="var(--brand-100)" />
          <circle cx="16" cy="16" r="6" fill="var(--brand-600)" />
        </>
      )}
      {variant === 1 && (
        <>
          <rect x="3" y="3" width="26" height="26" rx="6" fill="var(--brand-50)" />
          <path
            d="M9 22 L16 8 L23 22 Z"
            fill="var(--brand-600)"
          />
        </>
      )}
      {variant === 2 && (
        <>
          <rect x="3" y="3" width="26" height="26" rx="6" fill="var(--brand-100)" />
          <rect x="9" y="14" width="14" height="4" fill="var(--brand-700)" />
          <rect x="14" y="9" width="4" height="14" fill="var(--brand-700)" />
        </>
      )}
      {variant === 3 && (
        <>
          <circle cx="16" cy="16" r="13" fill="var(--brand-50)" />
          <path
            d="M8 20 Q16 6 24 20"
            stroke="var(--accent-500)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

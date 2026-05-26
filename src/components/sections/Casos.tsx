import Reveal from "../Reveal";

type Caso = {
  quote: string;
  author: string;
  business: string;
  city: string;
  initials: string;
  accent: string;
};

const CASOS: Caso[] = [
  {
    quote: "Ahora recibimos pagos con tarjeta y vendemos un 30% más.",
    author: "Patricia M.",
    business: "Almacén Las Flores",
    city: "La Florida",
    initials: "PM",
    accent: "from-brand-400 to-brand-700",
  },
  {
    quote: "Aumentamos el flujo de clientes desde que activamos Sencillito®.",
    author: "Jorge R.",
    business: "Minimarket El Sol",
    city: "Maipú",
    initials: "JR",
    accent: "from-accent-500 to-brand-500",
  },
  {
    quote: "Todo funciona desde un solo equipo. Antes tenía tres distintos.",
    author: "Camila V.",
    business: "Botillería Don Beto",
    city: "Concepción",
    initials: "CV",
    accent: "from-brand-300 to-brand-600",
  },
];

const METRICS = [
  { value: "+30%", label: "más ventas promedio" },
  { value: "5 min", label: "para empezar a vender" },
  { value: "24/7", label: "soporte comercial" },
  { value: "100%", label: "boletas en regla con SII" },
];

export default function Casos() {
  return (
    <section id="casos" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Comercios reales
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Historias de comercios que ya venden más.
            </h2>
          </div>
        </Reveal>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {CASOS.map((c, i) => (
            <Reveal as="li" key={c.author} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_20px_40px_-20px_rgba(63,24,128,0.35)]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="text-brand-300"
                >
                  <path
                    d="M9 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2H4v2h1a4 4 0 0 0 4-4Zm12 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2h-1v2h1a4 4 0 0 0 4-4Z"
                    fill="currentColor"
                  />
                </svg>
                <blockquote className="mt-4 text-lg font-medium leading-snug text-foreground">
                  “{c.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${c.accent} text-sm font-bold text-white`}
                  >
                    {c.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {c.author}
                    </span>
                    <span className="block text-xs text-muted">
                      {c.business} · {c.city}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={200}>
          <div className="mt-14 grid gap-4 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-4 sm:p-8">
            {METRICS.map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-3xl font-extrabold text-brand-gradient sm:text-4xl">
                  {m.value}
                </div>
                <div className="mt-1 text-xs text-muted sm:text-sm">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BreadcrumbJsonLd from "./BreadcrumbJsonLd";

type Props = {
  title: string;
  /** Formato ISO: YYYY-MM-DD */
  lastUpdated: string;
  /** Subtítulo breve opcional bajo el título. */
  intro?: string;
  /** Ruta relativa actual (ej. "/privacidad") para el breadcrumb JSON-LD. */
  breadcrumb?: { name: string; href: string };
  children: ReactNode;
};

const LEGAL_DOCS: { name: string; href: string; description: string }[] = [
  {
    name: "Política de Privacidad",
    href: "/privacidad",
    description: "Tratamiento de datos personales conforme a la Ley 19.628.",
  },
  {
    name: "Términos y Condiciones",
    href: "/terminos",
    description: "Uso del sitio y de la información comercial publicada.",
  },
  {
    name: "Términos de Arriendo",
    href: "/arriendo",
    description: "Condiciones de arriendo de equipos POS.",
  },
  {
    name: "Aviso Legal",
    href: "/aviso-legal",
    description: "Información corporativa de MUFIN SpA.",
  },
];

function RelatedLegalDocs({ currentHref }: { currentHref?: string }) {
  const others = LEGAL_DOCS.filter((d) => d.href !== currentHref);
  if (others.length === 0) return null;
  return (
    <nav aria-label="Otros documentos legales">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
        Otros documentos legales
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {others.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="group block rounded-xl border border-border bg-white p-4 transition-colors hover:border-brand-200"
            >
              <span className="block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                {d.name}
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {d.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Layout compartido por las páginas legales. Tipografía cuidada para
// lectura larga, con jerarquía clara de h2/h3 y avisos destacados.
export default function LegalLayout({
  title,
  lastUpdated,
  intro,
  breadcrumb,
  children,
}: Props) {
  return (
    <>
      {breadcrumb && <BreadcrumbJsonLd trail={[breadcrumb]} />}
      <Navbar />
      <main className="flex-1">
        <header className="bg-brand-gradient">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Información legal
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
                {intro}
              </p>
            )}
            <p className="mt-6 text-xs text-muted">
              Última actualización:{" "}
              <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
            </p>
          </div>
        </header>

        <article className="legal-prose mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          {children}
        </article>

        <div className="mx-auto max-w-3xl px-5 pb-12 sm:px-8">
          <RelatedLegalDocs currentHref={breadcrumb?.href} />
        </div>

        <div className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
          <div className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
            <p className="text-sm text-muted">
              ¿Tienes dudas sobre este documento?
            </p>
            <Link
              href="/"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Volver al inicio
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

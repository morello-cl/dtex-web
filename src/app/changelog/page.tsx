import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { CHANGELOG, type ChangeType } from "@/data/changelog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Novedades",
  description:
    "Cambios y mejoras de DTEx®: pagos con tarjeta, boletas electrónicas y Punto Sencillito® para almacenes y minimarkets en Chile.",
  alternates: { canonical: `${site.url}/changelog` },
};

const TYPE_LABEL: Record<ChangeType, string> = {
  added: "Nuevo",
  changed: "Mejora",
  fixed: "Corrección",
  removed: "Retirado",
};

const TYPE_STYLE: Record<ChangeType, string> = {
  added: "bg-accent-500/10 text-accent-600",
  changed: "bg-brand-50 text-brand-700",
  fixed: "bg-amber-50 text-amber-700",
  removed: "bg-rose-50 text-rose-700",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function ChangelogPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Novedades", href: "/changelog" }]} />
      <Navbar />
      <main className="flex-1">
        <section className="bg-brand-gradient">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Novedades
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              ¿Qué hay de{" "}
              <span className="text-brand-gradient">nuevo en DTEx®</span>?
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
              Aquí publicamos cada mejora y novedad del sitio. Si echas algo de
              menos, escríbenos por WhatsApp.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <ol className="relative space-y-12 border-l border-border pl-8 sm:pl-10">
            {CHANGELOG.map((release) => (
              <li key={release.version} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[37px] top-2 inline-flex h-4 w-4 items-center justify-center rounded-full border-4 border-white bg-brand-500 ring-1 ring-border sm:-left-[45px]"
                />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    v{release.version}
                  </h2>
                  <time
                    dateTime={release.date}
                    className="text-sm text-muted"
                  >
                    {formatDate(release.date)}
                  </time>
                </div>
                {release.summary && (
                  <p className="mt-2 text-base text-foreground/80">
                    {release.summary}
                  </p>
                )}

                <ul className="mt-5 space-y-3">
                  {release.changes.map((c, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-xl border border-border bg-white p-4"
                    >
                      <span
                        className={`mt-0.5 inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-wider ${TYPE_STYLE[c.type]}`}
                      >
                        {TYPE_LABEL[c.type]}
                      </span>
                      <p className="text-sm text-foreground/85">
                        {c.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="mt-16 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
            <p className="text-sm text-muted">
              ¿Tienes una idea o pediste algo y no la ves todavía?
            </p>
            <Link
              href="/#top"
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
        </section>
      </main>
      <Footer />
    </>
  );
}

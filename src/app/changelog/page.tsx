import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { CHANGELOG, SITE_VERSION, type ChangeType, type Release } from "@/data/changelog";
import { site, whatsappLink } from "@/lib/site";

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

// Color y texto juntos: el tipo nunca depende solo del color.
const TYPE_DOT: Record<ChangeType, string> = {
  added: "bg-accent-500",
  changed: "bg-brand-500",
  fixed: "bg-amber-500",
  removed: "bg-rose-500",
};

function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d || 1)).toLocaleDateString("es-CL", { ...opts, timeZone: "UTC" });
}

const formatMonth = (ym: string) => formatDate(ym, { month: "long", year: "numeric" });

const link =
  "font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

function Changes({ release }: { release: Release }) {
  return (
    <ul className="space-y-4">
      {release.changes.map((c, i) => (
        <li key={i} className="grid gap-x-4 gap-y-1 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
          <span className="inline-flex items-center gap-2 self-start text-sm font-semibold text-foreground sm:mt-px">
            <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[c.type]}`} />
            {TYPE_LABEL[c.type]}
          </span>
          <p className="max-w-prose text-base leading-relaxed text-foreground/80">{c.description}</p>
        </li>
      ))}
    </ul>
  );
}

// Lo último en grande: es lo que el comercio viene a ver. El historial queda
// plegado por mes para que la página no crezca con cada versión.
export default function ChangelogPage() {
  const [latest, ...older] = CHANGELOG;
  const months = new Map<string, Release[]>();
  for (const r of older) {
    const key = r.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), r]);
  }
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Novedades", href: "/changelog" }]} />
      <Navbar />
      <main className="flex-1">
        <section className="bg-brand-gradient">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Novedades
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
              Lo que mejoramos en DTEx® y en el Portal de pagos MUFIN, contado
              de forma simple. Estás usando la versión{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {SITE_VERSION}
              </span>
              .
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-14">
          <article aria-labelledby="ultima" className="rounded-3xl bg-brand-700 p-6 text-white sm:p-10">
            <p className="text-sm text-white/80">
              Lo más reciente, <time dateTime={latest.date}>{formatDate(latest.date)}</time>
            </p>
            <h2 id="ultima" className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {latest.summary}
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {latest.changes.map((c, i) => (
                <li key={i} className="rounded-2xl bg-white/10 p-5">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/85">
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${TYPE_DOT[c.type]}`} />
                    {TYPE_LABEL[c.type]}
                  </p>
                  <p className="mt-1 leading-relaxed">{c.description}</p>
                </li>
              ))}
            </ul>
          </article>

          <h2 className="mt-14 text-xl font-bold text-foreground">Historial</h2>
          <p className="mt-1 text-sm text-muted">Toca un mes y luego una versión para ver qué cambió.</p>
          {[...months].map(([month, releases], i) => (
            <details key={month} open={i === 0} className="group/mes mt-6">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded text-sm font-semibold text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 [&::-webkit-details-marker]:hidden">
                <span className="first-letter:uppercase">{formatMonth(month)}</span>
                <span className="font-normal tabular-nums">({releases.length})</span>
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-open/mes:rotate-180 motion-reduce:transition-none">
                  <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-white">
                {releases.map((r) => (
                  <details key={r.version} className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-4 rounded-2xl px-5 py-4 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 [&::-webkit-details-marker]:hidden">
                      <span className="flex-1 font-semibold text-foreground">{r.summary}</span>
                      <time dateTime={r.date} className="shrink-0 text-sm text-muted">
                        {formatDate(r.date, { day: "numeric", month: "short" })}
                      </time>
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none">
                        <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-6 pt-1">
                      <p className="mb-4 text-sm text-muted tabular-nums">Versión {r.version}</p>
                      <Changes release={r} />
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}

          <p className="mt-12 rounded-2xl bg-surface px-6 py-5 text-base text-muted">
            ¿Tienes una idea o pediste algo y todavía no lo ves aquí?{" "}
            <a href={whatsappLink("info")} target="_blank" rel="noopener noreferrer" className={link}>
              Escríbenos por WhatsApp
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

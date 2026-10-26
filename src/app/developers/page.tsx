import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Desarrolladores",
  description:
    "Documentación para integrar DTEx® con tu sistema: cobra con tarjeta y emite boletas electrónicas desde una app Android, y próximamente vía cloud y USB.",
  alternates: { canonical: `${site.url}/developers` },
};

// ponytail: Cloud y USB sin documentación todavía; al publicarse, darles su
// propia ruta bajo /developers y poner href como en App2App.
const VIAS: {
  name: string;
  tag: string;
  description: string;
  href?: string;
}[] = [
  {
    name: "App2App",
    tag: "Disponible",
    description:
      "Integra una app Android instalada en el mismo terminal que DTEx® para iniciar cobros, emitir boletas y consultar transacciones.",
    href: "/developers/app2app",
  },
  {
    name: "Cloud",
    tag: "En desarrollo",
    description:
      "Conecta sistemas de cualquier plataforma y envía cobros al terminal DTEx® a través de internet.",
  },
  {
    name: "USB",
    tag: "En desarrollo",
    description:
      "Conecta una caja o un punto de venta al terminal DTEx® por USB y úsalo como pinpad.",
  },
];

export default function DevelopersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[{ name: "Desarrolladores", href: "/developers" }]}
      />
      <Navbar />
      <main className="flex-1">
        <header className="bg-brand-gradient">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Conecta tu sistema con DTEx®
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
              Inicia cobros con tarjeta y emite boletas electrónicas desde tu
              ERP, sistema de restaurante o punto de venta. DTEx® procesa la
              operación en el terminal del comercio.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-xl font-bold text-brand-800">
            Formas de integración
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {VIAS.map((v, i) => {
              const body = (
                <>
                  <span className="flex flex-wrap items-center gap-3">
                    <span
                      className={`font-bold text-brand-800 ${i === 0 ? "text-2xl" : "text-lg"}`}
                    >
                      {v.name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.href ? "bg-accent-500 text-white" : "bg-surface-2 text-muted"}`}
                    >
                      {v.tag}
                    </span>
                  </span>
                  <span className="mt-2 block max-w-xl text-sm text-muted">
                    {v.description}
                  </span>
                  {v.href && (
                    <span className="mt-4 block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                      Leer la documentación
                    </span>
                  )}
                </>
              );
              return (
                <li key={v.name} className={i === 0 ? "md:col-span-2" : ""}>
                  {v.href ? (
                    <Link
                      href={v.href}
                      className="group block h-full rounded-3xl border border-border bg-white p-6 transition-colors hover:border-brand-300 sm:p-8"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="h-full rounded-2xl border border-dashed border-border bg-surface p-6">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
            <p className="text-sm text-muted">
              ¿Necesitas integrar tu sistema o quieres recibir novedades sobre
              Cloud y USB? Cuéntanos sobre tu proyecto y te ayudaremos a elegir
              la mejor alternativa.
            </p>
            <Link
              href="/contacto"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Hablar con el equipo de integraciones
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

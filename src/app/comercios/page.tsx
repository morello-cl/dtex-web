import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ComerciosForm from "@/components/ComerciosForm";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Inscribir comercio",
  description:
    "Inscribe tu comercio en la red DTEx® y empieza a aceptar pagos, emitir boletas y operar servicios desde un solo equipo.",
  alternates: { canonical: `${site.url}/comercios` },
  openGraph: {
    title: "Inscribir comercio en DTEx®",
    description:
      "Completa los datos de tu empresa y activa pagos, boletas y servicios en tu negocio.",
    url: `${site.url}/comercios`,
  },
};

export default function ComerciosPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Inscribir comercio", href: "/comercios" }]} />
      <Navbar />
      <main className="flex-1">
        <header className="bg-brand-gradient">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Inscripción de comercios
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Suma tu comercio a la red DTEx®
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
              Completa los datos en 2 pasos y nuestro equipo te contacta para
              coordinar la activación. La <strong>Clave SII</strong> y los{" "}
              <strong>datos bancarios</strong> se coordinan por canal seguro, no
              por web.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_300px]">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <ComerciosForm />
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  ¿Dudas antes de inscribirte?
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Habla con nuestro equipo comercial por WhatsApp.
                </p>
                <a
                  href={whatsappLink("info")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-600"
                >
                  WhatsApp comercial
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Qué necesitas a mano
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                  <li className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    RUT y razón social de la empresa
                  </li>
                  <li className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Datos del representante legal
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <p className="font-semibold">Sobre tus datos</p>
                <p className="mt-1.5 text-xs leading-relaxed">
                  Solo los usamos para activar tu comercio. La Clave SII y los
                  datos bancarios nunca se solicitan por web — los coordinamos
                  por canal seguro.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

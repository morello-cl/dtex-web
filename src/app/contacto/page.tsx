import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ContactForm from "@/components/ContactForm";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos y te ayudamos a activar DTEx® en tu comercio. Atendemos en horario hábil desde Villarrica, Chile.",
  alternates: { canonical: `${site.url}/contacto` },
  openGraph: {
    title: "Contacto DTEx®",
    description:
      "Habla con nuestro equipo comercial para activar pagos y servicios en tu negocio.",
    url: `${site.url}/contacto`,
  },
};

export default function ContactoPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Contacto", href: "/contacto" }]} />
      <Navbar />
      <main className="flex-1">
        <header className="bg-brand-gradient">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Contacto comercial
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Conversemos sobre tu comercio
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
              Cuéntanos qué necesitas y te ayudamos a elegir el equipo y activar
              los servicios en minutos. También puedes escribirnos por WhatsApp
              si prefieres una respuesta más rápida.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Respuesta rápida
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Si necesitas hablar al tiro, escríbenos por WhatsApp.
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
                  Datos de contacto
                </h2>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Email comercial
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${site.email}`}
                        className="font-medium text-brand-700 hover:text-brand-800"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Horario
                    </dt>
                    <dd className="text-foreground/80">
                      Lun – Vie, 9:00 a 18:00 hrs
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Oficina
                    </dt>
                    <dd className="text-foreground/80">
                      {site.mufinAddress.streetAddress}
                      <br />
                      {site.mufinAddress.addressLocality},{" "}
                      {site.mufinAddress.addressRegion}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

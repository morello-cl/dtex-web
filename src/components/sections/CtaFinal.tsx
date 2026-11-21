import Link from "next/link";
import Reveal from "../Reveal";
import { whatsappLink } from "@/lib/site";

export default function CtaFinal() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="bg-brand-gradient absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Lleva más servicios y más ventas a tu negocio.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            Conversemos. Te ayudamos a elegir el equipo y a dejar tu negocio
            listo para cobrar.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={whatsappLink("info")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/25 transition-colors hover:bg-brand-800 sm:w-auto"
            >
              Solicitar información
            </a>
            <a
              href={whatsappLink("quote")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 sm:w-auto"
            >
              Cotizar equipo
            </a>
            <a
              href={whatsappLink("sencillito")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 sm:w-auto"
            >
              Activar Punto Sencillito®
            </a>
          </div>
          <p className="mt-5 text-sm text-muted">
            ¿Prefieres escribir?{" "}
            <Link
              href="/contacto"
              className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:text-brand-800 hover:decoration-brand-400"
            >
              Usa el formulario de contacto
            </Link>
            .
          </p>
          <p className="mt-6 text-xs text-muted">
            Al contactarnos aceptas nuestra{" "}
            <Link
              href="/privacidad"
              className="underline decoration-brand-200 underline-offset-2 hover:text-brand-700 hover:decoration-brand-400"
            >
              Política de Privacidad
            </Link>
            {" "}y los{" "}
            <Link
              href="/terminos"
              className="underline decoration-brand-200 underline-offset-2 hover:text-brand-700 hover:decoration-brand-400"
            >
              Términos y Condiciones
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}

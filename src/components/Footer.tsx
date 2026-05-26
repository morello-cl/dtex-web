import Link from "next/link";
import Logo from "./Logo";
import SencillitoLogo from "./SencillitoLogo";
import { site, whatsappLink } from "@/lib/site";
import { SITE_VERSION } from "@/data/changelog";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo height={56} />
          <p className="mt-4 max-w-sm text-sm text-muted">
            Convierte tu negocio en un punto de pagos y servicios. Operado por
            Sencillito®.
          </p>
          <p className="mt-3 text-xs text-muted">
            DTEx® es una marca de {site.legalName}.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Producto
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/#beneficios" className="hover:text-brand-700">
                Beneficios
              </Link>
            </li>
            <li>
              <Link href="/#sencillito" className="hover:text-brand-700">
                Punto Sencillito®
              </Link>
            </li>
            <li>
              <Link href="/#equipos" className="hover:text-brand-700">
                Equipos POS
              </Link>
            </li>
            <li>
              <Link href="/#casos" className="hover:text-brand-700">
                Casos reales
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="hover:text-brand-700">
                Novedades
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Contacto
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a
                href={whatsappLink("info")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-700"
              >
                WhatsApp comercial
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="hover:text-brand-700"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.emailMufin}`}
                className="hover:text-brand-700"
              >
                {site.emailMufin}
              </a>
            </li>
            <li className="flex gap-3 pt-2">
              <a
                href={site.social.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted hover:text-brand-700"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
              </a>
              <a
                href={site.social.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted hover:text-brand-700"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4v2.4H7.7V14h2.7v8Z" />
                </svg>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Legal
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/privacidad" className="hover:text-brand-700">
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="hover:text-brand-700">
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link href="/arriendo" className="hover:text-brand-700">
                Términos de arriendo
              </Link>
            </li>
            <li>
              <Link href="/aviso-legal" className="hover:text-brand-700">
                Aviso legal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p>© {year} {site.legalName}. Todos los derechos reservados.</p>
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-700 hover:border-brand-200 hover:text-brand-800"
              aria-label={`Ver novedades — v${SITE_VERSION}`}
            >
              v{SITE_VERSION}
            </Link>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Operado por
            </span>
            <SencillitoLogo height={18} />
          </div>
        </div>
      </div>
    </footer>
  );
}

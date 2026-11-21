import Link from "next/link";
import Logo from "@/components/Logo";
import MufinEndorsement from "@/components/MufinEndorsement";
import { SITE_VERSION } from "@/data/changelog";
import { formattedMufinAddress, site, whatsappLink } from "@/lib/site";

const link =
  "font-medium text-mufin-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-mufin-700";

// Sin sellos ni certificaciones: solo afirmaciones verificables (HTTPS, datos legales).
export default function PortalFooter() {
  return (
    <footer className="border-t border-mufin-border pt-6 text-xs text-muted">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <span className="inline-flex items-center gap-1.5 font-medium text-accent-600">
          <svg
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 12 6h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5H6V4.5a2 2 0 1 1 4 0V6Z" />
          </svg>
          Conexión cifrada
        </span>
        <span>
          ¿Problemas para ingresar?{" "}
          <a
            href={whatsappLink("portal")}
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            Escríbenos por WhatsApp
          </a>
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <span className="inline-flex items-center gap-2">
          <Logo height={18} />
          <MufinEndorsement height={14} />
        </span>
        <nav aria-label="Legal" className="flex gap-5">
          <Link href="/changelog" className={link}>
            Versión <span className="tabular-nums">{SITE_VERSION}</span>
          </Link>
          <Link href="/terminos" className={link}>
            Términos
          </Link>
          <Link href="/privacidad" className={link}>
            Privacidad
          </Link>
        </nav>
      </div>

      <p className="mt-4 leading-relaxed">
        DTEx® es una marca registrada de {site.legalName}. ©{" "}
        {new Date().getFullYear()} {site.legalName}, RUT {site.mufinRut}.{" "}
        {formattedMufinAddress()}.
      </p>
    </footer>
  );
}

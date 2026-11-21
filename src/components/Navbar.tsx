"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MufinEndorsement from "./MufinEndorsement";
import Logo from "./Logo";
import { whatsappLink } from "@/lib/site";

const NAV_LINKS = [
  { href: "/#beneficios", label: "Beneficios" },
  { href: "/#equipos", label: "Equipos" },
  { href: "/#sencillito", label: "Punto Sencillito" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/80 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Sello bajo el wordmark, como "compraquí de BancoEstado": no quita ancho al menú. */}
        <Link
          href="/"
          aria-label="Inicio DTEx®, una aplicación MUFIN"
          className="flex flex-col items-start gap-0.5"
        >
          <Logo height={34} priority />
          <MufinEndorsement height={11} className="text-[11px] leading-none" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-brand-700"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {/* Acceso de comercios, como el "Ingreso comercios" de otras redes. */}
          <Link
            href="/portal"
            className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400"
          >
            Portal de pagos
          </Link>
          <a
            href={whatsappLink("info")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md"
          >
            Quiero más información
          </a>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-white">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-4 sm:px-8">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block py-3 text-base font-medium text-foreground/80"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/portal"
                className="block py-3 text-base font-medium text-brand-700"
                onClick={() => setOpen(false)}
              >
                Portal de pagos
              </Link>
            </li>
            <li className="pt-2">
              <a
                href={whatsappLink("info")}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-full bg-brand-700 px-5 py-3 text-center text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Quiero más información
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

"use client";

import { useRef, useState, type ReactNode } from "react";
import MufinLogo from "@/components/portal/MufinLogo";
import { Icon } from "@/components/portal/PortalNav";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

// Barra superior del celular; el botón abre el menú como cajón desde la izquierda (globals.css, .nav-drawer).
export default function MobileNav({ merchant, children }: { merchant: string; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const shut = () => {
    if (closing || !dialog.current?.open) return;
    setClosing(true);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      dialog.current?.close();
      setClosing(false);
    }, still ? 0 : 180);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-mufin-border bg-white/95 px-2 backdrop-blur lg:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-mufin-ink hover:bg-mufin-bg ${focus}`}
      >
        <Icon d="M4 6h16M4 12h16M4 18h16" className="h-6 w-6" />
      </button>
      <MufinLogo height={22} />
      <span className="ml-auto min-w-0 truncate pr-2 text-sm font-medium text-muted">{merchant}</span>
      <dialog
        ref={dialog}
        aria-label="Menú"
        data-closing={closing || undefined}
        onCancel={(e) => {
          e.preventDefault();
          shut();
        }}
        // Un toque en el fondo cae sobre el propio dialog; elegir una sección cierra el menú.
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as Element).closest("a")) shut();
        }}
        className="nav-drawer m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-transparent p-0 backdrop:bg-mufin-900/40"
      >
        <div className="relative h-full bg-white shadow-xl">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={shut}
            className={`absolute top-2.5 right-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-mufin-bg hover:text-mufin-ink ${focus}`}
          >
            <Icon d="M6 6l12 12M18 6 6 18" />
          </button>
          {children}
        </div>
      </dialog>
    </header>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

// Panel lateral sobre la página; en el celular ocupa la pantalla. La URL lo abre y cerrarlo vuelve a `close`.
export default function SidePanel({
  title,
  subtitle,
  badge,
  footer,
  close,
  children,
}: {
  title: string;
  subtitle?: string | null;
  badge?: ReactNode;
  // Acciones fijas al pie del panel (en el celular quedan al alcance del pulgar).
  footer?: ReactNode;
  close: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Primero la animación de salida (globals.css, .side-panel), después la navegación que desmonta el panel.
  // El dialog se cierra antes de navegar: si el servidor tarda, la página queda usable y no atrapada en el modal.
  const shut = () => {
    if (closing) return;
    setClosing(true);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => {
      dialog.current?.close();
      document.body.style.overflow = "";
      router.replace(close, { scroll: false });
    }, still ? 0 : 180);
  };

  // showModal deja el resto de la página inerte: el foco no sale del panel.
  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    heading.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer.current);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    // Escape dispara cancel; un clic en el fondo cae sobre el propio dialog.
    <dialog
      ref={dialog}
      aria-labelledby="panel-titulo"
      data-closing={closing || undefined}
      onCancel={(e) => {
        e.preventDefault();
        shut();
      }}
      onClick={(e) => e.target === e.currentTarget && shut()}
      className="side-panel m-0 ml-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-mufin-900/40 sm:max-w-lg"
    >
      <section className="flex h-full w-full flex-col bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-mufin-border p-5">
          <div className="min-w-0">
            {badge}
            <h2 id="panel-titulo" ref={heading} tabIndex={-1} className="text-lg font-bold text-mufin-ink outline-none first-letter:uppercase">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          <Link
            href={close}
            scroll={false}
            replace
            onClick={(e) => {
              e.preventDefault();
              shut();
            }}
            className={`inline-flex h-11 items-center rounded-xl border border-mufin-border px-4 text-sm font-semibold text-mufin-ink hover:border-mufin-700 ${focus}`}>
            Cerrar
          </Link>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-mufin-bg p-5">{children}</div>
        {footer && <footer className="flex flex-wrap gap-2 border-t border-mufin-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</footer>}
      </section>
    </dialog>
  );
}

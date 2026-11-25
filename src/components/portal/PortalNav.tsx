"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MufinLogo from "@/components/portal/MufinLogo";
import { logoutAction } from "@/lib/portal/actions";

export const NAV = [
  // Trazos de 24×24 al estilo Lucide: casa, recibo, billetes.
  { href: "/portal", label: "Inicio", icon: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/portal/ventas", label: "Ventas", icon: "M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6M9 16h3" },
  { href: "/portal/abonos", label: "Abonos", icon: "M2 7h20v10H2zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M6 10v4M18 10v4" },
] as const;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

export function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

/** Contenido del menú: lo usan la barra lateral (computador) y el cajón (celular). */
export default function PortalNav({ merchant }: { merchant: string }) {
  const path = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/portal" className={`rounded ${focus}`} aria-label="Portal de pagos MUFIN, inicio">
          <MufinLogo height={26} />
        </Link>
      </div>
      <nav aria-label="Secciones" className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV.map((n) => {
            const on = n.href === "/portal" ? path === n.href : path.startsWith(n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={on ? "page" : undefined}
                  className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors duration-150 ${focus} ${
                    on ? "bg-mufin-bg font-semibold text-mufin-700" : "text-mufin-ink hover:bg-mufin-bg/60"
                  }`}
                >
                  {on && <span aria-hidden="true" className="absolute inset-y-2 -left-3 w-1 rounded-r-full bg-mufin-700" />}
                  <Icon d={n.icon} className={`h-5 w-5 ${on ? "text-mufin-700" : "text-muted"}`} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Cerrar sesión va aparte de la navegación. */}
      <div className="border-t border-mufin-border p-3">
        <p className="truncate px-3 pt-1 pb-2 text-sm font-semibold text-mufin-ink" title={merchant}>
          {merchant}
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-muted transition-colors duration-150 hover:bg-mufin-bg/60 hover:text-mufin-ink ${focus}`}
          >
            <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

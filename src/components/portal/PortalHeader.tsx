import Link from "next/link";
import MufinLogo from "@/components/portal/MufinLogo";
import { logoutAction } from "@/lib/portal/actions";

const NAV = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/ventas", label: "Ventas" },
] as const;

export default function PortalHeader({ merchant, current }: { merchant: string; current: (typeof NAV)[number]["href"] }) {
  return (
    <header className="border-b border-mufin-border bg-white">
      {/* En móvil la navegación baja a una segunda fila: no cabe junto a "Cerrar sesión". */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
        <MufinLogo height={28} />
        <nav aria-label="Secciones" className="order-last -ml-3 flex w-full gap-1 sm:order-none sm:ml-2 sm:mr-auto sm:w-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={n.href === current ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700 ${
                n.href === current ? "bg-mufin-bg text-mufin-900" : "text-muted hover:text-mufin-900"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 items-center gap-4">
          <span className="hidden truncate text-sm font-medium text-mufin-900 md:block">{merchant}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="whitespace-nowrap rounded-xl border border-mufin-border bg-white px-3.5 py-2 text-sm font-medium text-mufin-900 hover:border-mufin-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

import MufinLogo from "@/components/portal/MufinLogo";
import PortalFooter from "@/components/portal/PortalFooter";
import { logoutAction } from "@/lib/portal/actions";
import type { Metadata } from "next";
import { requireMe } from "@/lib/portal/session";

// La plantilla de portal/layout no aplica a la página de su mismo segmento.
export const metadata: Metadata = {
  title: { absolute: "Inicio | Portal de pagos MUFIN" },
};

// ponytail: portada provisoria; el proyecto 2 la reemplaza por el panel de 7 días.
export default async function PortalPage() {
  const me = await requireMe();
  return (
    <div className="flex flex-1 flex-col bg-mufin-bg">
      <header className="border-b border-mufin-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <MufinLogo height={28} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-mufin-900">
          Hola, {me.merchant.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ingresaste como {me.user.email}.
        </p>
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-xl border border-mufin-border bg-white px-4 py-2.5 text-sm font-medium text-mufin-900 hover:border-mufin-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700"
          >
            Cerrar sesión
          </button>
        </form>
      </main>
      <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <PortalFooter />
      </div>
    </div>
  );
}

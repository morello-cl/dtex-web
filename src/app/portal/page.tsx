import { logoutAction } from "@/lib/portal/actions";
import { requireMe } from "@/lib/portal/session";

// ponytail: portada provisoria; el proyecto 2 la reemplaza por el panel de 7 días.
export default async function PortalPage() {
  const me = await requireMe();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-mufin-900">
        Hola, {me.merchant.name}
      </h1>
      <p className="mt-2 text-sm text-muted">Ingresaste como {me.user.email}.</p>
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-xl border border-mufin-border bg-white px-4 py-2.5 text-sm font-medium text-mufin-900 hover:border-mufin-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

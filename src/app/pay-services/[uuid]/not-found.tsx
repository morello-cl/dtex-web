import Link from "next/link";
import Logo from "@/components/Logo";
import TechnologyByMufin from "@/components/TechnologyByMufin";

export default function PayServicesNotFound() {
  return (
    <main className="bg-brand-gradient bg-dotgrid flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-xl shadow-brand-900/8">
        <Link href="/" className="inline-flex" aria-label="Ir al inicio de DTEx®">
          <Logo height={48} priority />
        </Link>
        <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-brand-900">Pago no encontrado</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          El enlace no es válido o ya expiró. Solicita una nueva carga de saldo desde tu equipo DTEx®.
        </p>
        <Link href="/" className="mt-7 inline-flex rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800">
          Volver a dtex.cl
        </Link>
        <div className="mt-8 flex justify-center border-t border-border pt-5">
          <TechnologyByMufin height={19} />
        </div>
      </div>
    </main>
  );
}

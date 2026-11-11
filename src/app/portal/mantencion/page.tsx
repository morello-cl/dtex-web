import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/portal/AuthForms";

export const metadata: Metadata = { title: "Volvemos en unos minutos" };

export default function MantencionPage() {
  return (
    <AuthCard title="Volvemos en unos minutos">
      <p className="text-sm leading-relaxed text-muted">
        Estamos teniendo un problema para conectar con nuestros servidores. Tus
        ventas y abonos no se ven afectados.
      </p>
      <Link
        href="/portal"
        className="mt-6 inline-block rounded-xl bg-mufin-900 px-5 py-3 text-sm font-semibold text-white hover:bg-mufin-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700"
      >
        Reintentar
      </Link>
    </AuthCard>
  );
}

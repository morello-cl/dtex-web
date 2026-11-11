import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, LinkForm } from "@/components/portal/AuthForms";

export const metadata: Metadata = { title: "Definir contraseña" };

export default function EnlacePage() {
  return (
    <AuthCard title="Te enviamos un enlace para definir tu contraseña">
      <LinkForm />
      <p className="mt-6 text-center text-sm">
        <Link
          href="/portal/ingresar"
          className="font-medium text-mufin-700 underline-offset-4 hover:underline"
        >
          Volver a ingresar
        </Link>
      </p>
    </AuthCard>
  );
}

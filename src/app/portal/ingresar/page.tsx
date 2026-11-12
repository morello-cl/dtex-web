import type { Metadata } from "next";
import { AuthCard, LoginForm } from "@/components/portal/AuthForms";

export const metadata: Metadata = { title: "Ingresar" };

export default function IngresarPage() {
  return (
    <AuthCard title="Ingresa a tu portal de pagos">
      <LoginForm />
    </AuthCard>
  );
}

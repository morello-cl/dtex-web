import type { Metadata } from "next";
import { AuthCard, PasswordForm } from "@/components/portal/AuthForms";

// no-referrer: el token del enlace no debe filtrarse en el header Referer.
export const metadata: Metadata = { title: "Define tu contraseña", referrer: "no-referrer" };

export default async function ClavePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthCard title="Define tu contraseña">
      <PasswordForm token={token} />
    </AuthCard>
  );
}

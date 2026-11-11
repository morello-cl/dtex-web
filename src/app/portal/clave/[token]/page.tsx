import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, LinkProblem, PasswordForm } from "@/components/portal/AuthForms";
import { LINK_PROBLEMS, checkLink, isServiceDown, type LinkStatus } from "@/lib/portal/auth";

// no-referrer: el token del enlace no debe filtrarse en el header Referer.
export const metadata: Metadata = { title: "Tu enlace", referrer: "no-referrer" };

export default async function ClavePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // Se revisa al abrir el enlace, no al guardar: el usuario no debe escribir
  // una contraseña para recién enterarse de que el enlace no sirve.
  let status: LinkStatus | null = null;
  try {
    status = await checkLink(token);
  } catch (e) {
    if (isServiceDown(e)) redirect("/portal/mantencion");
    status = "invalid";
  }

  if (status !== "valid") {
    return (
      <AuthCard title={LINK_PROBLEMS[status].title}>
        <LinkProblem problem={status} />
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Define tu contraseña">
      <PasswordForm token={token} />
    </AuthCard>
  );
}

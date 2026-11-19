import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Portal de pagos MUFIN",
    template: "%s | Portal de pagos MUFIN",
  },
  description: "Revisa tus ventas y tus abonos en el Portal de pagos MUFIN.",
  robots: { index: false, follow: false },
  // No heredar canonical ni Open Graph de la landing de DTEx®; la imagen sale de opengraph-image.tsx.
  alternates: { canonical: null },
  // Sin título propio: WhatsApp usa el <title> de cada página (p. ej. «Definir contraseña | Portal de pagos MUFIN»).
  openGraph: {
    description: "Revisa tus ventas y tus abonos en el Portal de pagos MUFIN.",
    siteName: "MUFIN",
    locale: "es_CL",
    type: "website",
  },
  twitter: null,
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-mufin-ink">
      {children}
    </div>
  );
}

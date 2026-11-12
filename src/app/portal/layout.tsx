import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Portal de pagos MUFIN",
    template: "%s | Portal de pagos MUFIN",
  },
  description: "Revisa tus ventas y tus abonos en el Portal de pagos MUFIN.",
  robots: { index: false, follow: false },
  // No heredar canonical ni Open Graph de la landing de DTEx®.
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-mufin-900">
      {children}
    </div>
  );
}

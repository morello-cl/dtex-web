import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Portal de pagos MUFIN", template: "%s | Portal de pagos MUFIN" },
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-white text-mufin-900">{children}</div>;
}

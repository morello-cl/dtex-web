import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Portal de comercios", template: "%s | Portal DTEx®" },
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-white text-mufin-900">{children}</div>;
}

import PortalShell from "@/components/portal/PortalShell";
import { requireMe } from "@/lib/portal/session";

// El menú vive en el layout: al cambiar de sección se mantiene y solo se recarga el contenido (loading.tsx).
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMe();
  return <PortalShell merchant={me.merchant.name}>{children}</PortalShell>;
}

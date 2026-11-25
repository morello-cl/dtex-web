import type { ReactNode } from "react";
import MobileNav from "@/components/portal/MobileNav";
import PortalFooter from "@/components/portal/PortalFooter";
import PortalNav from "@/components/portal/PortalNav";

// Menú lateral fijo desde lg; en pantallas menores, barra superior con cajón.
export default function PortalShell({ merchant, children }: { merchant: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 bg-mufin-bg">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-mufin-border bg-white lg:block">
        <PortalNav merchant={merchant} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav merchant={merchant}>
          <PortalNav merchant={merchant} />
        </MobileNav>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
        <div className="mx-auto mt-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
          <PortalFooter />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SaleView } from "@/lib/portal/sale";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

function Rows({ rows }: { rows: { label: string; value: string; strong?: boolean }[] }) {
  return (
    <dl className="divide-y divide-mufin-border text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4 py-2">
          <dt className={r.strong ? "font-semibold text-mufin-900" : "text-muted"}>{r.label}</dt>
          <dd className={`text-right tabular-nums ${r.strong ? "font-semibold text-mufin-900" : "text-mufin-900"}`}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Panel lateral sobre la tabla; en el celular ocupa la pantalla. La URL (?venta=) lo abre y cerrarlo la limpia.
export default function SalePanel({ v, error, close }: { v: SaleView | null; error: string | null; close: string }) {
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.replace(close, { scroll: false });
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close, router]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <Link href={close} scroll={false} replace aria-hidden="true" tabIndex={-1} className="absolute inset-0 bg-mufin-900/40" />
      <section role="dialog" aria-modal="true" aria-labelledby="venta-titulo" className="relative flex h-full w-full flex-col bg-white shadow-xl sm:max-w-md">
        <header className="flex items-start justify-between gap-4 border-b border-mufin-border p-5">
          <div>
            <h2 id="venta-titulo" ref={heading} tabIndex={-1} className="text-lg font-bold text-mufin-900 outline-none">
              {v ? v.title : "Detalle de la venta"}
            </h2>
            {v && <p className="mt-1 text-sm text-muted">{v.issued}</p>}
          </div>
          <Link href={close} scroll={false} replace className={`inline-flex h-11 items-center rounded-xl border border-mufin-border px-4 text-sm font-semibold text-mufin-900 hover:border-mufin-700 ${focus}`}>
            Cerrar
          </Link>
        </header>
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {!v ? (
            <p className="text-sm text-muted">{error}</p>
          ) : (
            <>
              {v.receiver && (
                <section>
                  <h3 className="text-sm font-semibold text-mufin-900">Cliente</h3>
                  <p className="mt-2 text-sm text-mufin-900">
                    {v.receiver.name}, RUT {v.receiver.rut}
                  </p>
                  {(v.receiver.address || v.receiver.commune) && (
                    <p className="text-sm text-muted">{[v.receiver.address, v.receiver.commune].filter(Boolean).join(", ")}</p>
                  )}
                </section>
              )}
              {v.reference && <p className="text-sm text-muted">{v.reference}</p>}
              <section>
                <h3 className="text-sm font-semibold text-mufin-900">Detalle del documento</h3>
                {v.items.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">Documento por monto, sin detalle de productos.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-mufin-border text-sm">
                    {v.items.map((i) => (
                      <li key={i.key} className="flex justify-between gap-4 py-2">
                        <span>
                          <span className="block text-mufin-900">{i.description}</span>
                          <span className="block text-xs text-muted tabular-nums">{i.detail}</span>
                        </span>
                        <span className="tabular-nums text-mufin-900">{i.total}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 border-t border-mufin-border">
                  <Rows rows={v.totals} />
                </div>
              </section>
              {v.payment.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-mufin-900">Pago</h3>
                  <div className="mt-2">
                    <Rows rows={v.payment} />
                  </div>
                </section>
              )}
              <p className="text-xs text-muted">{v.place}</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

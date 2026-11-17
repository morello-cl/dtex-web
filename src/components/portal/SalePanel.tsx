"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SaleView } from "@/lib/portal/sale";
import BrandMark, { hasBrand } from "./BrandMark";
import MufinLogo from "./MufinLogo";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

function Rows({ rows }: { rows: { label: string; value: string; strong?: boolean }[] }) {
  return (
    <dl className="divide-y divide-mufin-border text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4 py-2">
          <dt className={r.strong ? "font-semibold text-mufin-ink" : "text-muted"}>{r.label}</dt>
          <dd className={`text-right tabular-nums ${r.strong ? "font-semibold text-mufin-ink" : "text-mufin-ink"}`}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const card = "rounded-xl border border-mufin-border p-4";
const h3 = "text-sm font-semibold text-mufin-ink";
const TONE = { ok: "bg-accent-50 text-accent-600", warn: "bg-warn-50 text-warn-700", wait: "bg-mufin-bg text-muted" };

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text).then(() => setDone(true), () => {})}
      className={`inline-flex h-9 items-center rounded-[10px] border border-mufin-border px-3 text-sm font-semibold text-mufin-700 hover:border-mufin-700 ${focus}`}
    >
      <span aria-live="polite">{done ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

function Sii({ s }: { s: NonNullable<SaleView["sii"]> }) {
  return (
    <section className={`${card} bg-white`}>
      <h3 className={h3}>Documento electrónico en el SII</h3>
      <p className={`mt-3 inline-block rounded-full px-2.5 py-1 text-sm font-semibold ${TONE[s.tone]}`}>{s.label}</p>
      {s.message && <p className="mt-2 text-sm text-mufin-ink">{s.message}</p>}
      {s.trackId && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Track ID del SII</p>
            <p className="font-mono text-base font-semibold text-mufin-ink">{s.trackId}</p>
          </div>
          <Copy text={s.trackId} />
        </div>
      )}
      {s.sentAt && <p className="mt-2 text-xs text-muted">Enviado al SII el {s.sentAt}.</p>}
      {s.trackId && <p className="mt-2 text-xs text-muted">Con el track ID puedes consultar el envío en el SII.</p>}
    </section>
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
            <h2 id="venta-titulo" ref={heading} tabIndex={-1} className="text-lg font-bold text-mufin-ink outline-none">
              {v ? v.title : "Detalle de la venta"}
            </h2>
            {v && <p className="mt-1 text-sm text-muted">{v.issued}</p>}
          </div>
          <Link href={close} scroll={false} replace className={`inline-flex h-11 items-center rounded-xl border border-mufin-border px-4 text-sm font-semibold text-mufin-ink hover:border-mufin-700 ${focus}`}>
            Cerrar
          </Link>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-mufin-bg p-5">
          {!v ? (
            <p className="text-sm text-muted">{error}</p>
          ) : (
            <>
              <section className={`${card} bg-white`}>
                <p className="text-sm text-muted">Total cobrado</p>
                <p className="text-3xl font-extrabold tracking-tight text-mufin-ink tabular-nums">{v.total}</p>
                {v.payment[0] && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-mufin-ink">
                    {hasBrand(v.brand) && v.methodNoBrand ? (
                      <>
                        <BrandMark name={v.brand} size="h-8 w-8" />
                        <span className="sr-only">{v.brand}</span>
                        {v.methodNoBrand}
                      </>
                    ) : (
                      v.payment[0].value
                    )}
                  </p>
                )}
              </section>
              {v.sii && <Sii s={v.sii} />}
              {v.receiver && (
                <section className={`${card} bg-white`}>
                  <h3 className={h3}>Cliente</h3>
                  <p className="mt-2 text-sm text-mufin-ink">
                    {v.receiver.name}, RUT {v.receiver.rut}
                  </p>
                  {(v.receiver.address || v.receiver.commune) && (
                    <p className="text-sm text-muted">{[v.receiver.address, v.receiver.commune].filter(Boolean).join(", ")}</p>
                  )}
                </section>
              )}
              <section className={`${card} bg-white`}>
                <h3 className={h3}>Detalle del documento</h3>
                {v.reference && <p className="mt-1 text-sm text-muted">{v.reference}</p>}
                {v.items.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">Documento por monto, sin detalle de productos.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-mufin-border text-sm">
                    {v.items.map((i) => (
                      <li key={i.key} className="flex justify-between gap-4 py-2">
                        <span>
                          <span className="block text-mufin-ink">{i.description}</span>
                          <span className="block text-xs text-muted tabular-nums">{i.detail}</span>
                        </span>
                        <span className="tabular-nums text-mufin-ink">{i.total}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 border-t border-mufin-border">
                  <Rows rows={v.totals} />
                </div>
              </section>
              {v.payment.length > 0 && (
                <section className={`${card} bg-white`}>
                  <h3 className={h3}>Pago</h3>
                  <div className="mt-2">
                    <Rows rows={v.payment} />
                  </div>
                  {/* Solo los pagos con tarjeta pasan por MUFIN; el efectivo lo recibe el comercio. */}
                  {v.methodNoBrand && (
                    <p className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-mufin-bg px-3 py-2.5 text-sm font-medium text-mufin-ink">
                      Gestionado por <MufinLogo height={18} />
                    </p>
                  )}
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

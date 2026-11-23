"use client";

import { useState, type ReactNode } from "react";
import type { SaleView } from "@/lib/portal/sale";
import BrandMark, { hasBrand } from "./BrandMark";
import MufinLogo from "./MufinLogo";
import { Icon } from "./PortalNav";
import SidePanel from "./SidePanel";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";
const card = "rounded-2xl border border-mufin-border bg-white";
const h3 = "text-xs font-semibold tracking-wide text-muted";
const TONE = { ok: "bg-accent-50 text-accent-600", warn: "bg-warn-50 text-warn-700", wait: "bg-mufin-bg text-muted" };
const action = `inline-flex h-11 flex-1 items-center justify-center gap-2 sm:flex-none rounded-xl px-4 text-sm font-semibold ${focus}`;
const ICON = {
  check: "M20 6 9 17l-5-5",
  alert: "M12 8v5M12 16.5v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18",
  download: "M12 3v12M7 10l5 5 5-5M5 21h14",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
};

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className={`${card} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className={h3}>{title}</h3>
        {aside}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: { label: string; value: string; strong?: boolean }[] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map((r) => (
        <div key={r.label} className={`flex justify-between gap-4 ${r.strong ? "border-t border-dashed border-mufin-border pt-2 font-semibold text-mufin-ink" : ""}`}>
          <dt className={r.strong ? "" : "text-muted"}>{r.label}</dt>
          <dd className="text-right text-mufin-ink tabular-nums">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text).then(() => setDone(true), () => {})}
      className={`${action} border border-mufin-border bg-white text-mufin-ink hover:border-mufin-700`}
    >
      <Icon d={done ? ICON.check : ICON.copy} className="h-4 w-4" />
      <span aria-live="polite">{done ? "Copiado" : label}</span>
    </button>
  );
}

const DOT = {
  done: "border-accent-600 bg-accent-600 text-white",
  warn: "border-warn-700 bg-warn-700 text-white",
  current: "border-mufin-700 bg-white text-mufin-700",
  todo: "border-mufin-border bg-white text-transparent",
};

function Sii({ s }: { s: NonNullable<SaleView["sii"]> }) {
  return (
    <Section title="Documento en el SII">
      {/* Etapas: emitido → enviado → respuesta. */}
      <ol className="space-y-0">
        {s.steps.map((x, i) => (
          <li key={x.label} className="relative flex gap-3 pb-4 last:pb-0">
            {i < s.steps.length - 1 && (
              <span aria-hidden="true" className={`absolute top-6 bottom-0 left-[11px] w-0.5 ${x.state === "done" ? "bg-accent-600" : "bg-mufin-border"}`} />
            )}
            <span aria-hidden="true" className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${DOT[x.state]}`}>
              {x.state === "done" && <Icon d={ICON.check} className="h-3.5 w-3.5" />}
              {x.state === "warn" && <span className="text-xs font-bold">!</span>}
              {x.state === "current" && <span className="h-2 w-2 rounded-full bg-mufin-700" />}
            </span>
            <div className="min-w-0 pt-0.5 text-sm">
              <p className={x.state === "todo" ? "text-muted" : "font-medium text-mufin-ink"}>
                {x.label}
                <span className="sr-only">{{ done: ", listo", warn: ", requiere atención", current: ", en curso", todo: ", pendiente" }[x.state]}</span>
              </p>
              {i === 1 && s.sentAt && <p className="text-xs text-muted">{s.sentAt}</p>}
              {i === 2 && s.message && <p className="mt-1 text-sm text-mufin-ink">{s.message}</p>}
            </div>
          </li>
        ))}
      </ol>
      {s.trackId && (
        <div className="mt-4 rounded-xl bg-mufin-bg px-4 py-3">
          <p className="text-xs text-muted">Track ID del SII</p>
          <p className="font-mono text-base font-semibold tracking-wide text-mufin-ink">{s.trackId}</p>
          <p className="mt-1 text-xs text-muted">
            Consúltalo en{" "}
            <a href="https://www.sii.cl" target="_blank" rel="noopener noreferrer" className={`font-semibold text-mufin-700 underline underline-offset-2 ${focus}`}>
              www.sii.cl
            </a>
            .
          </p>
        </div>
      )}
    </Section>
  );
}

function Badge({ s }: { s: NonNullable<SaleView["sii"]> }) {
  const d = s.tone === "ok" ? ICON.check : s.tone === "warn" ? ICON.alert : ICON.clock;
  return (
    <p className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE[s.tone]}`}>
      <Icon d={d} className="h-3.5 w-3.5" />
      SII: {s.short}
    </p>
  );
}

// La URL (?venta=) abre el panel y cerrarlo la limpia.
export default function SalePanel({ v, error, close }: { v: SaleView | null; error: string | null; close: string }) {
  const footer = v && (v.xmlHref || v.sii?.trackId) && (
    <>
      {v.xmlHref && (
        <a href={v.xmlHref} className={`${action} bg-mufin-700 text-white hover:bg-mufin-900`}>
          <Icon d={ICON.download} className="h-4 w-4" />
          Descargar XML
        </a>
      )}
      {v.sii?.trackId && <CopyButton text={v.sii.trackId} label="Copiar track ID" />}
    </>
  );
  return (
    <SidePanel title={v ? v.title : "Detalle de la venta"} subtitle={v?.issued} badge={v?.sii && <Badge s={v.sii} />} footer={footer || undefined} close={close}>
      {!v ? (
        <p className="text-sm text-muted">{error}</p>
      ) : (
        <>
          <section className={`${card} overflow-hidden`}>
            <div className="p-5">
              <p className="text-sm text-muted">Total cobrado</p>
              <p className="mt-0.5 text-4xl font-extrabold tracking-tight text-mufin-ink tabular-nums">{v.total}</p>
              {v.breakdown && (
                <p className="mt-1 text-sm text-muted tabular-nums">
                  Documento {v.breakdown.doc} + propina {v.breakdown.tip}
                </p>
              )}
            </div>
            {v.payment[0] && (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-mufin-border bg-mufin-bg/50 px-5 py-3">
                <p className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-mufin-ink">
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
                {/* Solo los pagos con tarjeta pasan por MUFIN; el efectivo lo recibe el comercio. */}
                {v.methodNoBrand && (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                    Gestionado por <MufinLogo height={14} />
                  </span>
                )}
              </div>
            )}
          </section>

          <dl className={`${card} grid grid-cols-2 gap-4 p-4 text-sm sm:p-5`}>
            {v.meta.map((m) => (
              <div key={m.label}>
                <dt className="text-xs text-muted">{m.label}</dt>
                <dd className="mt-0.5 font-medium text-mufin-ink">{m.value}</dd>
              </div>
            ))}
          </dl>

          {v.sii && <Sii s={v.sii} />}

          <Section title="Detalle del documento">
            {v.reference && <p className="-mt-1 mb-3 text-sm text-muted">{v.reference}</p>}
            {v.items.length === 0 ? (
              <p className="text-sm text-muted">Documento por monto, sin detalle de productos.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {v.items.map((i) => (
                  <li key={i.key} className="flex justify-between gap-4">
                    <span className="min-w-0">
                      <span className="block font-medium text-mufin-ink">{i.description}</span>
                      <span className="block text-xs text-muted tabular-nums">{i.detail}</span>
                    </span>
                    <span className="font-medium text-mufin-ink tabular-nums">{i.total}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 border-t border-mufin-border pt-3">
              <Rows rows={v.totals} />
            </div>
          </Section>

          {v.payment.length > 0 && (
            <Section title="Pago">
              <Rows rows={v.payment} />
            </Section>
          )}

          {v.receiver && (
            <Section title="Cliente">
              <p className="text-sm font-medium text-mufin-ink">{v.receiver.name}</p>
              <p className="text-sm text-muted">RUT {v.receiver.rut}</p>
              {(v.receiver.address || v.receiver.commune) && (
                <p className="text-sm text-muted">{[v.receiver.address, v.receiver.commune].filter(Boolean).join(", ")}</p>
              )}
            </Section>
          )}
        </>
      )}
    </SidePanel>
  );
}

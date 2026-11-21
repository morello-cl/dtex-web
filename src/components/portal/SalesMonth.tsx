import Link from "next/link";
import type { MonthView } from "@/lib/portal/month";
import { formatClp } from "@/lib/portal/sales";
import DaysTable from "./DaysTable";
import MonthPicker from "./MonthPicker";

const box = "rounded-2xl border border-mufin-border bg-white";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";
const count = (n: number) => `${n.toLocaleString("es-CL")} ${n === 1 ? "venta" : "ventas"}`;
const docs = (n: number) => `${n.toLocaleString("es-CL")} ${n === 1 ? "documento" : "documentos"}`;

/** Cambia entre la vista del día y la del mes. Va en el encabezado de ambas. */
export function ViewToggle({ day, month, current }: { day: string; month: string; current: "day" | "month" }) {
  const opts = [
    { key: "day", label: "Día", href: `/portal/ventas?fecha=${day}` },
    { key: "month", label: "Mes", href: `/portal/ventas?mes=${month}` },
  ] as const;
  return (
    <nav aria-label="Ver ventas por" className="inline-flex rounded-[12px] border border-mufin-border bg-white p-1">
      {opts.map((o) => (
        <Link
          key={o.key}
          href={o.href}
          scroll={false}
          aria-current={o.key === current ? "page" : undefined}
          className={`inline-flex h-9 items-center rounded-[9px] px-4 text-sm font-semibold ${focus} ${
            o.key === current ? "bg-mufin-700 text-white" : "text-mufin-ink hover:bg-mufin-bg"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}

function Summary({ v }: { v: MonthView }) {
  const stat = "flex flex-col gap-0.5";
  const docTotal = v.documents.reduce((a, x) => a + x.amount, 0);
  const docCount = v.documents.reduce((a, x) => a + x.count, 0);
  return (
    <section aria-label="Resumen del mes" className={`${box} relative p-5 sm:p-6`}>
      <dl className="flex flex-wrap items-end gap-x-10 gap-y-4 sm:pr-48">
        <div className={stat}>
          <dt className="text-sm text-muted tabular-nums">Total, {count(v.count)}</dt>
          <dd className="text-4xl font-extrabold tracking-tight text-mufin-ink tabular-nums">{formatClp(v.total)}</dd>
        </div>
        {v.methods.map((m) => (
          <div key={m.key} className={stat}>
            <dt className="flex items-center gap-2 text-sm text-muted">
              <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.key === "card" ? "bg-mufin-700" : "bg-accent-500"}`} />
              {m.label} <span className="tabular-nums">{count(m.count)}</span>
            </dt>
            <dd className="text-xl font-semibold text-mufin-ink tabular-nums">{formatClp(m.amount)}</dd>
          </div>
        ))}
        <div className={stat}>
          <dt className="text-sm text-muted">Propinas</dt>
          <dd className="text-xl font-semibold text-mufin-ink tabular-nums">{formatClp(v.tip)}</dd>
        </div>
        {v.cashback > 0 && (
          <div className={stat}>
            <dt className="text-sm text-muted">Efectivo entregado con tarjeta</dt>
            <dd className="text-xl font-semibold text-mufin-ink tabular-nums">{formatClp(v.cashback)}</dd>
          </div>
        )}
      </dl>
      {v.documents.length > 0 && (
        <details className="group text-sm">
          <summary className={`mt-4 inline-flex cursor-pointer list-none items-center rounded font-medium text-mufin-700 hover:underline sm:absolute sm:top-6 sm:right-6 sm:mt-0 ${focus}`}>
            <span className="group-open:hidden">Ver documentos emitidos</span>
            <span className="hidden group-open:inline">Ocultar documentos emitidos</span>
          </summary>
          <dl className="mt-4 max-w-md space-y-1.5 border-t border-mufin-border pt-4 lg:max-w-[calc(50%-0.75rem)]">
            {v.documents.map((x) => (
              <div key={x.dte_type} className="flex items-baseline justify-between gap-3">
                <dt className="text-mufin-ink">
                  {x.dte_type_name} <span className="text-muted tabular-nums">{docs(x.count)}</span>
                </dt>
                <dd className={`tabular-nums ${x.amount < 0 ? "text-warn-700" : "text-mufin-ink"}`}>{formatClp(x.amount)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 border-t border-mufin-border pt-1.5 font-semibold text-mufin-ink">
              <dt>
                Total <span className="font-normal text-muted tabular-nums">{docs(docCount)}</span>
              </dt>
              <dd className="tabular-nums">{formatClp(docTotal)}</dd>
            </div>
          </dl>
        </details>
      )}
    </section>
  );
}

function Days({ v }: { v: MonthView }) {
  return (
    <section id="dias" className={`${box} scroll-mt-4 p-5 sm:p-6`}>
      {v.rows.length === 0 ? (
        <>
          <h2 className="font-semibold text-mufin-ink">Ventas por día</h2>
          <p className="mt-6 text-sm text-muted">No registras ventas este mes.</p>
        </>
      ) : (
        <DaysTable key={v.month} rows={v.rows} />
      )}
    </section>
  );
}

export default function SalesMonth({ v, today }: { v: MonthView; today: string }) {
  const day = v.isCurrent ? today : `${v.month}-01`;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mufin-ink">{v.title}</h1>
          {v.isCurrent && <p className="mt-1 text-sm text-muted">Hasta hoy, actualizado a las {v.asOf}.</p>}
        </div>
        <ViewToggle day={day} month={v.month} current="month" />
      </header>
      <MonthPicker month={v.month} min={v.min} max={v.max} prev={v.prev} next={v.next} />
      <Summary v={v} />
      <Days v={v} />
    </div>
  );
}

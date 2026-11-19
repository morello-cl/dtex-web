import Link from "next/link";
import type { PayoutsView, PayoutView } from "@/lib/portal/payouts";
import { formatClp } from "@/lib/portal/sales";
import BrandMark, { hasBrand } from "./BrandMark";
import MufinLogo from "./MufinLogo";
import PayoutsTable, { State } from "./PayoutsTable";
import { Chevron } from "./SalesTable";
import SidePanel from "./SidePanel";

const box = "rounded-2xl border border-mufin-border bg-white";
const card = "rounded-xl border border-mufin-border bg-white p-4";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

type Line = { label: string; amount: number };

function Breakdown({ lines, total, totalLabel }: { lines: Line[]; total: number; totalLabel: string }) {
  return (
    <dl className="space-y-1.5 text-sm">
      {lines.map((l) => (
        <div key={l.label} className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">{l.label}</dt>
          <dd className="tabular-nums text-mufin-ink">{formatClp(l.amount)}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-3 border-t border-mufin-border pt-2 font-semibold text-mufin-ink">
        <dt>{totalLabel}</dt>
        <dd className="tabular-nums">{formatClp(total)}</dd>
      </div>
    </dl>
  );
}

const count = (n: number) => `${n.toLocaleString("es-CL")} ${n === 1 ? "abono" : "abonos"}`;

// Igual que la tira de días en Ventas: row-reverse para que en pantallas angostas parta en el mes actual.
function MonthStrip({ v }: { v: PayoutsView }) {
  return (
    <nav aria-label="Elegir mes" className="-mx-4 flex flex-row-reverse overflow-x-auto px-4 sm:mx-0 sm:flex-row sm:px-0">
      <ol className="flex min-w-max gap-1.5">
        {v.months.map((m) => (
          <li key={m.month}>
            <Link
              href={`/portal/abonos?mes=${m.month}`}
              scroll={false}
              aria-current={m.selected ? "date" : undefined}
              className={`flex w-14 flex-col items-center rounded-xl py-2 ${focus} ${
                m.selected ? "bg-mufin-700 text-white" : "bg-white text-mufin-ink hover:bg-mufin-bg"
              }`}
            >
              <span className={`text-xs tabular-nums ${m.selected ? "text-white" : "text-muted"}`}>{m.year}</span>
              <span className="text-lg font-bold">{m.name}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Dot({ paid }: { paid: boolean }) {
  return <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${paid ? "bg-accent-500" : "bg-warn-200"}`} />;
}

function Summary({ v }: { v: PayoutsView }) {
  const s = v.summary;
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section aria-label="Abonos del mes" className={`${box} p-5 sm:p-6 lg:col-span-3`}>
        <p className="text-5xl font-extrabold tracking-tight text-mufin-ink tabular-nums">{formatClp(s.total)}</p>
        <p className="mt-2 text-sm text-muted tabular-nums">{count(s.count)} de ventas de este mes.</p>
        <dl className="mt-5 divide-y divide-mufin-border border-t border-mufin-border text-sm">
          {[
            { paid: true, label: "Pagados", n: s.paidCount, amount: s.paid },
            { paid: false, label: "Pendientes de pago", n: s.pendingCount, amount: s.pending },
          ].map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3 py-3">
              <dt className="flex items-center gap-2 font-semibold text-mufin-ink">
                <Dot paid={r.paid} />
                {r.label}
                <span className="font-normal text-muted tabular-nums">{count(r.n)}</span>
              </dt>
              <dd className="font-semibold tabular-nums text-mufin-ink">{formatClp(r.amount)}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="disponible" className={`${box} p-5 sm:p-6 lg:col-span-2`}>
        <h2 id="disponible" className="font-semibold text-mufin-ink">
          Abono disponible
        </h2>
        {v.available.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No hay ventas con tarjeta en espera de abono.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">En espera de pago. Se envía al banco cuando cierra el día; hasta entonces el monto es estimado.</p>
            <ul className="mt-4 space-y-5">
              {v.available.map((a) => (
                <li key={a.key}>
                  <p className="mb-2 text-sm font-medium text-mufin-ink first-letter:uppercase">Ventas del {a.sale}</p>
                  <Breakdown lines={a.lines} total={a.amount} totalLabel="Monto a abonar" />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

export function PayoutList({ v }: { v: PayoutsView }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-mufin-ink">Abonos</h1>
        <p className="mt-1 text-sm text-muted">Lo que te depositamos por tus ventas con tarjeta, día por día.</p>
      </header>
      <MonthStrip v={v} />
      <Summary v={v} />
      <section aria-labelledby="mes" className={`${box} p-5 sm:p-6`}>
        <h2 id="mes" className="font-semibold text-mufin-ink">
          {v.title}
        </h2>
        {v.rows.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No hay abonos de ventas de este mes.</p>
        ) : (
          <PayoutsTable rows={v.rows} adjustments={v.adjustments} />
        )}
      </section>
    </div>
  );
}

// La URL (?abono=) abre el panel y cerrarlo la limpia.
export function PayoutPanel({ v, error, close }: { v: PayoutView | null; error: string | null; close: string }) {
  return (
    <SidePanel title={v ? v.title : "Detalle del abono"} subtitle={v && `Enviado al banco el ${v.sentOn}.`} close={close}>
      {!v ? (
        <p className="text-sm text-muted">{error}</p>
      ) : (
        <>
          <section className={card}>
            <p className="text-sm text-muted">{v.state === "paid" ? "Monto abonado" : "Monto a abonar"}</p>
            <p className="text-3xl font-extrabold tracking-tight text-mufin-ink tabular-nums">{formatClp(v.amount)}</p>
            <p className="mt-2">
              <State state={v.state} label={v.stateLabel} />
            </p>
            <p className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-mufin-bg px-3 py-2.5 text-sm font-medium text-mufin-ink">
              Gestionado por <MufinLogo height={18} />
            </p>
          </section>
          <section className={card}>
            <h3 className="mb-2 text-sm font-semibold text-mufin-ink">Desglose</h3>
            <Breakdown lines={v.lines} total={v.amount} totalLabel={v.state === "paid" ? "Monto abonado" : "Monto a abonar"} />
            <p className="mt-3 text-xs text-muted">{v.methodNote}</p>
            {v.pendingDifference !== 0 && (
              <p className="mt-3 rounded-lg bg-warn-50 px-3 py-2 text-sm text-warn-700">
                Hay una diferencia de <span className="font-semibold tabular-nums">{formatClp(v.pendingDifference)}</span>. Se ajustará en tu próximo abono.
              </p>
            )}
          </section>
          <section className={card}>
            <h3 className="text-sm font-semibold text-mufin-ink">Movimientos</h3>
            {!v.hasFees && <p className="mt-1 text-xs text-muted">Este abono no tiene el detalle de comisión por venta; el total está en el desglose.</p>}
            {v.movements.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Este abono no tiene movimientos.</p>
            ) : (
              <ul className="mt-2 divide-y divide-mufin-border text-sm">
                {v.movements.map((m) => {
                  if (m.kind === "adjustment")
                    return (
                      <li key={m.key} className="flex items-baseline justify-between gap-4 py-2.5">
                        <span className="text-mufin-ink">{m.label}</span>
                        <span className={`font-semibold tabular-nums ${m.amount < 0 ? "text-warn-700" : "text-mufin-ink"}`}>{formatClp(m.amount)}</span>
                      </li>
                    );
                  const body = (
                    <>
                      <span className="min-w-0">
                        <span className="block font-medium text-mufin-ink">{m.document}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-muted">
                          <span className="tabular-nums">{m.time}</span>
                          {hasBrand(m.brand) ? (
                            <>
                              <BrandMark name={m.brand} size="-my-1 h-6 w-6" />
                              <span className="sr-only">{m.brand}</span>
                              {m.methodNoBrand}
                            </>
                          ) : (
                            m.method
                          )}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold tabular-nums text-mufin-ink">{formatClp(m.amount)}</span>
                        {m.fee !== null && <span className="block text-xs text-muted tabular-nums">comisión e IVA {formatClp(m.fee)}</span>}
                        {m.difference !== 0 && <span className="block text-xs text-warn-700 tabular-nums">diferencia {formatClp(m.difference)}</span>}
                      </span>
                      <span className="self-center text-muted">{m.href && <Chevron />}</span>
                    </>
                  );
                  const grid = "grid grid-cols-[minmax(0,1fr)_auto_1.25rem] gap-x-3 py-2.5";
                  return (
                    <li key={m.key}>
                      {m.href ? (
                        <Link href={m.href} aria-label={`${m.document}, ver detalle de la venta`} className={`${grid} -mx-2 rounded-lg px-2 hover:bg-mufin-bg ${focus}`}>
                          {body}
                        </Link>
                      ) : (
                        <div className={grid}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <p className="text-sm">
            <Link href={v.salesHref} className={`font-medium text-mufin-700 hover:underline ${focus}`}>
              Ver las ventas con tarjeta de ese día
            </Link>
          </p>
        </>
      )}
    </SidePanel>
  );
}

export function NextPayout({ n }: { n: { title: string; amount: number; note: string; href: string } }) {
  return (
    <Link href={n.href} className={`mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 ${box} px-5 py-4 hover:border-mufin-700 sm:px-6 ${focus}`}>
      <span>
        <span className="block text-sm text-muted">{n.title}</span>
        <span className="block text-sm text-mufin-ink first-letter:uppercase">{n.note}</span>
      </span>
      <span className="text-2xl font-bold tabular-nums text-mufin-ink">{formatClp(n.amount)}</span>
    </Link>
  );
}

import Link from "next/link";
import type { PayoutsView, PayoutView } from "@/lib/portal/payouts";
import { formatClp } from "@/lib/portal/sales";

const box = "rounded-2xl border border-mufin-border bg-white";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

type Line = { label: string; amount: number };

function Breakdown({ lines, total, totalLabel }: { lines: Line[]; total: number; totalLabel: string }) {
  return (
    <dl className="space-y-1.5 text-sm">
      {lines.map((l) => (
        <div key={l.label} className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">{l.label}</dt>
          <dd className="tabular-nums text-mufin-900">{formatClp(l.amount)}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-3 border-t border-mufin-border pt-2 font-semibold text-mufin-900">
        <dt>{totalLabel}</dt>
        <dd className="tabular-nums">{formatClp(total)}</dd>
      </div>
    </dl>
  );
}

// Pagado en turquesa; pendiente en ámbar suave: no es un error, es una espera.
function State({ state, label }: { state: "paid" | "pending"; label: string }) {
  const tone = state === "paid" ? "bg-accent-50 text-accent-600" : "bg-warn-50 text-warn-700";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{label}</span>;
}

function MonthNav({ v }: { v: PayoutsView }) {
  const link = (month: string | null, label: string) =>
    month ? (
      <Link href={`/portal/abonos?mes=${month}`} className={`inline-flex h-11 items-center rounded-xl border border-mufin-border bg-white px-4 font-semibold text-mufin-900 hover:border-mufin-700 ${focus}`}>
        {label}
      </Link>
    ) : (
      <span className="inline-flex h-11 items-center rounded-xl border border-transparent px-4 text-muted/60">{label}</span>
    );
  return (
    <nav aria-label="Elegir mes" className="flex items-center gap-2 text-sm">
      {link(v.prevMonth, "Mes anterior")}
      {link(v.nextMonth, "Mes siguiente")}
    </nav>
  );
}

export function PayoutList({ v }: { v: PayoutsView }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-mufin-900">Abonos</h1>
          <p className="mt-1 text-sm text-muted">Lo que te depositamos por tus ventas con tarjeta, día por día.</p>
        </div>
        <MonthNav v={v} />
      </header>

      {v.available.length > 0 && (
        <section aria-labelledby="disponible" className="rounded-2xl border border-accent-500 bg-white p-5 sm:p-6">
          <h2 id="disponible" className="font-semibold text-mufin-900">
            Abono disponible
          </h2>
          <p className="mt-1 text-sm text-muted">
            En espera de pago. Se envía al banco cuando cierra el día; hasta entonces el monto es estimado.
          </p>
          <ul className="mt-4 grid gap-6 lg:grid-cols-2">
            {v.available.map((a) => (
              <li key={a.key}>
                <p className="mb-2 text-sm font-medium text-mufin-900 first-letter:uppercase">Ventas del {a.sale}</p>
                <Breakdown lines={a.lines} total={a.amount} totalLabel="Monto a abonar" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="mes" className={`${box} p-5 sm:p-6`}>
        <h2 id="mes" className="font-semibold text-mufin-900">
          {v.title}
        </h2>
        {v.rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No hay abonos de ventas de este mes.</p>
        ) : (
          <ul className="mt-2 divide-y divide-mufin-border">
            {v.rows.map((r) => (
              <li key={r.uuid}>
                <Link href={`/portal/abonos/${r.uuid}`} className={`-mx-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl px-2 py-3 hover:bg-mufin-bg ${focus}`}>
                  <span>
                    <span className="block text-sm font-medium text-mufin-900 first-letter:uppercase">Ventas del {r.sale}</span>
                    <span className="mt-1 block">
                      <State state={r.state} label={r.stateLabel} />
                    </span>
                  </span>
                  <span className="text-lg font-bold tabular-nums text-mufin-900">{formatClp(r.amount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function PayoutDetail({ v }: { v: PayoutView }) {
  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link href="/portal/abonos" className={`font-medium text-mufin-700 hover:underline ${focus}`}>
          Volver a abonos
        </Link>
      </p>
      <header>
        <h1 className="text-2xl font-bold text-mufin-900">{v.title}</h1>
        <p className="mt-2">
          <State state={v.state} label={v.stateLabel} />
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <section aria-label="Desglose" className={`${box} p-5 sm:p-6 lg:col-span-3`}>
          <p className="text-5xl font-extrabold tracking-tight text-mufin-900 tabular-nums">{formatClp(v.amount)}</p>
          <div className="mt-5">
            <Breakdown lines={v.lines} total={v.amount} totalLabel={v.state === "paid" ? "Monto abonado" : "Monto a abonar"} />
          </div>
        </section>
        <section className={`${box} space-y-3 p-5 text-sm text-muted sm:p-6 lg:col-span-2`}>
          <p>Enviado al banco el {v.sentOn}.</p>
          <p>{v.methodNote}</p>
          {v.pendingDifference !== 0 && (
            <p className="rounded-xl bg-warn-50 px-3 py-2 text-warn-700">
              Hay una diferencia de <span className="font-semibold tabular-nums">{formatClp(v.pendingDifference)}</span>. Se ajustará en tu
              próximo abono.
            </p>
          )}
          <p>
            <Link href={v.salesHref} className={`font-medium text-mufin-700 hover:underline ${focus}`}>
              Ver las ventas con tarjeta de ese día
            </Link>
          </p>
        </section>
      </div>

      <section aria-labelledby="movimientos" className={`${box} p-5 sm:p-6`}>
        <h2 id="movimientos" className="font-semibold text-mufin-900">
          Movimientos
        </h2>
        {!v.hasFees && <p className="mt-1 text-sm text-muted">Este abono no tiene el detalle de comisión por venta; el total está en el desglose.</p>}
        {v.movements.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Este abono no tiene movimientos.</p>
        ) : (
          <ul className="mt-4 divide-y divide-mufin-border text-sm">
            {v.movements.map((m) =>
              m.kind === "sale" ? (
                <li key={m.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 py-3 lg:grid-cols-[3.5rem_1.2fr_1.4fr_8rem] lg:items-center">
                  <span className="order-2 text-muted tabular-nums lg:order-none">{m.time}</span>
                  <span className="order-1 font-medium text-mufin-900 lg:order-none">{m.document}</span>
                  <span className="order-4 col-span-2 text-muted lg:order-none lg:col-span-1">{m.method}</span>
                  <span className="order-1 row-span-2 text-right lg:order-none lg:row-span-1">
                    <span className="block font-semibold tabular-nums text-mufin-900">{formatClp(m.amount)}</span>
                    {m.fee !== null && <span className="block text-xs text-muted tabular-nums">comisión e IVA {formatClp(m.fee)}</span>}
                    {m.difference !== 0 && <span className="block text-xs text-warn-700 tabular-nums">diferencia {formatClp(m.difference)}</span>}
                  </span>
                </li>
              ) : (
                <li key={m.key} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="text-mufin-900">{m.label}</span>
                  <span className={`font-semibold tabular-nums ${m.amount < 0 ? "text-warn-700" : "text-mufin-900"}`}>{formatClp(m.amount)}</span>
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

export function NextPayout({ n }: { n: { title: string; amount: number; note: string; href: string } }) {
  return (
    <Link href={n.href} className={`mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 ${box} px-5 py-4 hover:border-mufin-700 sm:px-6 ${focus}`}>
      <span>
        <span className="block text-sm text-muted">{n.title}</span>
        <span className="block text-sm text-mufin-900 first-letter:uppercase">{n.note}</span>
      </span>
      <span className="text-2xl font-bold tabular-nums text-mufin-900">{formatClp(n.amount)}</span>
    </Link>
  );
}

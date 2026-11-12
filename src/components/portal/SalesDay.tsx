import Link from "next/link";
import type { DayView, Method } from "@/lib/portal/day";
import { formatClp } from "@/lib/portal/sales";

const box = "rounded-2xl border border-mufin-border bg-white";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

function href(fecha: string, medio: Method | null = null, cursor: string | null = null) {
  const q = new URLSearchParams({ fecha });
  if (medio) q.set("medio", medio);
  if (cursor) q.set("cursor", cursor);
  return `/portal/ventas?${q}`;
}

const docs = (n: number) => `${n.toLocaleString("es-CL")} ${n === 1 ? "documento" : "documentos"}`;
const count = (n: number) => `${n.toLocaleString("es-CL")} ${n === 1 ? "venta" : "ventas"}`;

function DayPicker({ d, today, min }: { d: DayView; today: string; min: string }) {
  return (
    <div className="space-y-3">
      {/* row-reverse: en pantallas angostas el scroll parte al final, donde está hoy. */}
      <nav aria-label="Elegir día" className="-mx-4 flex flex-row-reverse overflow-x-auto px-4 sm:mx-0 sm:flex-row sm:px-0">
        <ol className="flex min-w-max gap-1.5">
          {d.strip.map((s) => (
            <li key={s.date}>
              <Link
                href={href(s.date, d.method)}
                scroll={false}
                aria-current={s.selected ? "date" : undefined}
                className={`flex w-12 flex-col items-center rounded-xl py-2 ${focus} ${
                  s.selected ? "bg-mufin-700 text-white" : "bg-white text-mufin-900 hover:bg-mufin-bg"
                }`}
              >
                <span className={`text-xs ${s.selected ? "text-white" : s.label === "hoy" ? "font-bold" : "text-muted"}`}>
                  {s.label}
                </span>
                <span className="text-lg font-bold tabular-nums">{s.day}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      {/* Sin JS: el calendario nativo envía la fecha por GET. */}
      <form action="/portal/ventas" className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="fecha" className="text-muted">
          Otro día
        </label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          required
          min={min}
          max={today}
          defaultValue={d.date}
          className={`rounded-xl border border-mufin-border bg-white px-3 py-1.5 text-mufin-900 ${focus}`}
        />
        {d.method && <input type="hidden" name="medio" value={d.method} />}
        <button type="submit" className={`rounded-xl bg-mufin-700 px-3.5 py-1.5 font-medium text-white hover:bg-mufin-900 ${focus}`}>
          Ver día
        </button>
      </form>
    </div>
  );
}

function Summary({ d }: { d: DayView }) {
  const extra = [`propinas ${formatClp(d.tip)}`];
  // Cashback: extra cobrado con tarjeta y entregado en efectivo. El vuelto en efectivo no entra.
  if (d.cashback) extra.push(`efectivo entregado con tarjeta ${formatClp(d.cashback)}`);
  const docTotal = d.documents.reduce((a, x) => a + x.amount, 0);
  const docCount = d.documents.reduce((a, x) => a + x.count, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section aria-label="Por medio de pago" className={`${box} p-5 sm:p-6 lg:col-span-3`}>
        <p className="text-5xl font-extrabold tracking-tight text-mufin-900 tabular-nums">{formatClp(d.total)}</p>
        <p className="mt-2 text-sm text-muted tabular-nums">
          {count(d.count)}, {extra.join(", ")}.
        </p>
        <dl className="mt-5 divide-y divide-mufin-border border-t border-mufin-border text-sm">
          {d.methods.map((m) => (
            <div key={m.key} className="py-3">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="flex items-center gap-2 font-semibold text-mufin-900">
                  <MethodDot card={m.key === "card"} />
                  {m.label}
                  <span className="font-normal text-muted tabular-nums">{count(m.count)}</span>
                </dt>
                <dd className="font-semibold tabular-nums text-mufin-900">{formatClp(m.amount)}</dd>
              </div>
              {m.sub.map((s) => (
                <div key={s.label} className="mt-1.5 flex items-baseline justify-between gap-3 pl-6 text-muted">
                  <dt>
                    {s.label} <span className="tabular-nums">{count(s.count)}</span>
                  </dt>
                  <dd className="tabular-nums">{formatClp(s.amount)}</dd>
                </div>
              ))}
            </div>
          ))}
        </dl>
      </section>
      <section className={`${box} p-5 sm:p-6 lg:col-span-2`}>
        <h2 className="font-semibold text-mufin-900">Documentos emitidos</h2>
        {d.documents.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Sin documentos este día.</p>
        ) : (
          <dl className="mt-4 space-y-2 text-sm">
            {d.documents.map((x) => (
              <div key={x.dte_type} className="flex items-baseline justify-between gap-3">
                <dt className="text-mufin-900">
                  {x.dte_type_name} <span className="text-muted tabular-nums">{docs(x.count)}</span>
                </dt>
                <dd className={`tabular-nums ${x.amount < 0 ? "text-warn-700" : "text-mufin-900"}`}>{formatClp(x.amount)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 border-t border-mufin-border pt-2 font-semibold text-mufin-900">
              <dt>
                Total <span className="font-normal text-muted tabular-nums">{docs(docCount)}</span>
              </dt>
              <dd className="tabular-nums">{formatClp(docTotal)}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}

function MethodDot({ card }: { card: boolean }) {
  return <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${card ? "bg-mufin-700" : "bg-accent-500"}`} />;
}

const FILTERS: { key: Method | null; label: string }[] = [
  { key: null, label: "Todas" },
  { key: "cash", label: "Efectivo" },
  { key: "card", label: "Tarjeta" },
];

function SalesList({ d }: { d: DayView }) {
  const empty = d.method === "cash" ? "No hay ventas en efectivo este día." : d.method === "card" ? "No hay ventas con tarjeta este día." : "No registras ventas este día.";
  return (
    <section className={`${box} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-mufin-900">Ventas</h2>
        <nav aria-label="Filtrar por medio de pago" className="flex gap-2">
          {FILTERS.map((f) => {
            const on = f.key === d.method;
            return (
              <Link
                key={f.label}
                href={href(d.date, f.key)}
                scroll={false}
                aria-current={on ? "true" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${focus} ${
                  on ? "bg-mufin-700 text-white" : "border border-mufin-border bg-white text-mufin-900 hover:border-mufin-700"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {d.rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-mufin-border text-sm">
          {d.rows.map((r) => (
            <li key={r.key} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 py-3 lg:grid-cols-[3.5rem_1.2fr_1.2fr_1.4fr_8rem] lg:items-center">
              <span className="order-2 text-muted tabular-nums lg:order-none">{r.time}</span>
              <span className={`order-1 font-medium lg:order-none ${r.voided ? "text-muted line-through" : "text-mufin-900"}`}>
                {r.document}
                {r.voided && <span className="ml-2 rounded-full bg-mufin-bg px-2 py-0.5 text-xs font-normal text-muted no-underline">Anulada</span>}
              </span>
              <span className="order-4 col-span-2 flex items-center gap-2 text-muted lg:order-none lg:col-span-1">
                <MethodDot card={r.isCard} />
                {r.method}
              </span>
              <span className="order-5 col-span-2 text-muted lg:order-none lg:col-span-1">{r.place}</span>
              <span className="order-1 row-span-2 text-right lg:order-none lg:row-span-1">
                <span
                  className={`block font-semibold tabular-nums ${r.voided ? "text-muted line-through" : r.negative ? "text-warn-700" : "text-mufin-900"}`}
                >
                  {formatClp(r.amount)}
                </span>
                {r.tip > 0 && <span className="block text-xs text-muted tabular-nums">propina {formatClp(r.tip)}</span>}
                {r.cashback > 0 && (
                  <span className="block text-xs text-muted tabular-nums">efectivo entregado {formatClp(r.cashback)}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {d.nextCursor && (
        <Link href={href(d.date, d.method, d.nextCursor)} className={`mt-4 inline-block font-medium text-mufin-700 hover:underline ${focus}`}>
          Ver más ventas
        </Link>
      )}
    </section>
  );
}

function Attempts({ title, empty, rows }: { title: string; empty: string; rows: DayView["rejected"] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-mufin-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-mufin-border text-sm">
          {rows.map((r) => (
            <li key={r.key} className="grid grid-cols-[3.5rem_1fr_auto] gap-x-4 py-3">
              <span className="text-muted tabular-nums">{r.time}</span>
              <span>
                {r.reason && <span className="block text-mufin-900">{r.reason}</span>}
                <span className="block text-muted">{r.method}</span>
              </span>
              <span className="tabular-nums text-muted">{formatClp(r.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Rejections({ d }: { d: DayView }) {
  return (
    <section className={`${box} p-5 sm:p-6`}>
      <h2 className="font-semibold text-mufin-900">Pagos no completados</h2>
      <p className="mt-1 text-sm text-muted">No suman ni restan a los totales.</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Attempts title="Rechazados" empty="No hay pagos rechazados este día." rows={d.rejected} />
        <Attempts title="Cancelados por el cliente" empty="No hay pagos cancelados este día." rows={d.cancelled} />
      </div>
    </section>
  );
}

export default function SalesDay({ d, today, min }: { d: DayView; today: string; min: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-mufin-900 first-letter:uppercase">{d.title}</h1>
        {d.isToday && <p className="mt-1 text-sm text-muted">Actualizado a las {d.asOf}.</p>}
      </header>
      <DayPicker d={d} today={today} min={min} />
      <Summary d={d} />
      <SalesList d={d} />
      <Rejections d={d} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PayoutsView } from "@/lib/portal/payouts";
import { formatClp } from "@/lib/portal/sales";
import { Chevron } from "./SalesTable";

type Row = PayoutsView["rows"][number];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";
const money = (v: number, dim = false) => <span className={`tabular-nums ${dim || !v ? "text-muted" : "text-mufin-ink"}`}>{v ? formatClp(v) : "—"}</span>;

// Pagado en turquesa; pendiente en ámbar suave: no es un error, es una espera.
export function State({ state, label }: { state: "paid" | "pending"; label: string }) {
  const tone = state === "paid" ? "bg-accent-50 text-accent-600" : "bg-warn-50 text-warn-700";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{label}</span>;
}

// ponytail: sin ordenar por columna como en Ventas; un mes son a lo más 31 abonos ya ordenados por día.
export default function PayoutsTable({ rows, adjustments }: { rows: Row[]; adjustments: boolean }) {
  const router = useRouter();
  const th = "py-2 pr-4 font-medium text-muted first:pl-2 last:pr-2";
  return (
    <>
      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="w-full whitespace-nowrap text-sm">
          <thead>
            <tr className="border-b border-mufin-border text-left">
              <th scope="col" className={th}>Día de venta</th>
              <th scope="col" className={`${th} text-right`}>Ventas</th>
              <th scope="col" className={`${th} text-right`}>Ventas con tarjeta</th>
              <th scope="col" className={`${th} text-right`}>Comisión e IVA</th>
              {adjustments && <th scope="col" className={`${th} text-right`}>Regularización</th>}
              <th scope="col" className={`${th} text-right`}>Monto</th>
              <th scope="col" className={th}>Estado</th>
              <th scope="col" className={th}>
                <span className="sr-only">Detalle</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mufin-border">
            {rows.map((r) => (
              // Toda la fila abre el detalle con el mouse; con teclado, el botón de la última columna.
              <tr
                key={r.uuid}
                onClick={(e) => !(e.target as HTMLElement).closest("a, button") && router.push(r.href, { scroll: false })}
                className="group cursor-pointer hover:bg-mufin-bg"
              >
                <td className="py-2 pr-4 pl-2 text-mufin-ink first-letter:uppercase">{r.sale}</td>
                <td className="py-2 pr-4 text-right text-muted tabular-nums">{r.salesCount.toLocaleString("es-CL")}</td>
                <td className="py-2 pr-4 text-right">{money(r.gross)}</td>
                <td className="py-2 pr-4 text-right">{money(r.fees, true)}</td>
                {adjustments && <td className="py-2 pr-4 text-right">{money(r.adjustment)}</td>}
                <td className="py-2 pr-4 text-right font-semibold tabular-nums text-mufin-ink">{formatClp(r.amount)}</td>
                <td className="py-2 pr-4">
                  <State state={r.state} label={r.stateLabel} />
                </td>
                <td className="py-2 pr-2">
                  <Link
                    href={r.href}
                    scroll={false}
                    aria-label={`Ver detalle del abono de las ventas del ${r.sale}`}
                    title="Ver detalle"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-muted group-hover:bg-white group-hover:text-mufin-700 hover:text-mufin-700 ${focus}`}
                  >
                    <Chevron />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* En el celular la tabla no cabe: cada abono es una tarjeta que abre el detalle. */}
      <ul className="mt-4 divide-y divide-mufin-border text-sm lg:hidden">
        {rows.map((r) => (
          <li key={r.uuid}>
            <Link
              href={r.href}
              scroll={false}
              aria-label={`Abono de las ventas del ${r.sale}, ver detalle`}
              className={`-mx-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 rounded-xl px-2 py-3 hover:bg-mufin-bg ${focus}`}
            >
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-mufin-ink first-letter:uppercase">{r.sale}</span>
                  <span className="font-semibold tabular-nums text-mufin-ink">{formatClp(r.amount)}</span>
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                  <State state={r.state} label={r.stateLabel} />
                  <span className="tabular-nums">
                    {r.salesCount.toLocaleString("es-CL")} {r.salesCount === 1 ? "venta" : "ventas"}
                  </span>
                </span>
              </span>
              <span className="self-center text-muted">
                <Chevron />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

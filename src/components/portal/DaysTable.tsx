"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import type { MonthView } from "@/lib/portal/month";
import { formatClp } from "@/lib/portal/sales";
import { Chevron, PAGE, Pager, SortIcon } from "./SalesTable";

type Row = MonthView["rows"][number];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";
const money = (v: number) => <span className={`tabular-nums ${v ? "text-mufin-ink" : "text-muted"}`}>{v ? formatClp(v) : "—"}</span>;
const sales = (n: number) => `${n.toLocaleString("es-CL")} ${n === 1 ? "venta" : "ventas"}`;

function Best() {
  return <span className="ml-2 rounded-full bg-mufin-bg px-2 py-0.5 text-xs font-semibold text-mufin-700">Mejor día</span>;
}

const col = createColumnHelper<Row>();
// Mismas columnas y estilo que la tabla de ventas del día (SalesTable).
const columns = [
  col.accessor("date", {
    header: "Día",
    cell: (c) => (
      <span className={c.row.original.empty ? "text-muted" : "text-mufin-ink"}>
        {c.row.original.label}
        {c.row.original.best && <Best />}
      </span>
    ),
  }),
  col.accessor("count", { header: "Ventas", cell: (c) => <span className={`tabular-nums ${c.getValue() ? "text-mufin-ink" : "text-muted"}`}>{c.getValue().toLocaleString("es-CL")}</span> }),
  col.accessor("cash", { header: "Efectivo", cell: (c) => money(c.getValue()) }),
  col.accessor("card", { header: "Tarjeta", cell: (c) => money(c.getValue()) }),
  col.accessor("tip", { header: "Propina", cell: (c) => money(c.getValue()) }),
  col.accessor("amount", {
    header: "Total",
    cell: (c) => <span className={`font-semibold tabular-nums ${c.getValue() < 0 ? "text-warn-700" : c.getValue() ? "text-mufin-ink" : "text-muted"}`}>{formatClp(c.getValue())}</span>,
  }),
  col.display({
    id: "detail",
    header: () => <span className="sr-only">Ver el día</span>,
    cell: (c) =>
      c.row.original.href && (
      <Link
        href={c.row.original.href}
        aria-label={`Ver ventas del ${c.row.original.label.toLowerCase()}`}
        title="Ver el día"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-muted group-hover:bg-white group-hover:text-mufin-700 hover:text-mufin-700 ${focus}`}
      >
        <Chevron />
      </Link>
      ),
  }),
];

const RIGHT = new Set(["count", "cash", "card", "tip", "amount"]);

// Una fila por día; ordena y pagina en el navegador (a lo más 31 filas). Cada fila abre la vista del día.
export default function DaysTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const tips = rows.some((r) => r.tip > 0);
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility: { tip: tips } },
    onSortingChange: (u) => {
      setSorting(u);
      table.setPageIndex(0);
    },
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: PAGE } },
    getRowId: (r) => r.date,
  });
  const sorted = table.getRowModel().rows;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-mufin-ink">Ventas por día</h2>
        <Pager table={table} total={rows.length} anchor="dias" label="días" />
      </div>
      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="w-full whitespace-nowrap text-sm">
          <thead>
            {table.getHeaderGroups().map((g) => (
              <tr key={g.id} className="border-b border-mufin-border text-left">
                {g.headers.map((h) => {
                  const dir = h.column.getIsSorted();
                  const right = RIGHT.has(h.column.id);
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined}
                      className={`py-2 pr-4 font-medium text-muted first:pl-2 last:pr-2 ${right ? "text-right" : ""}`}
                    >
                      {h.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={`inline-flex items-center gap-1 rounded hover:text-mufin-ink ${dir ? "text-mufin-ink" : ""} ${focus}`}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <SortIcon dir={dir} />
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-mufin-border">
            {sorted.map((row) => {
              const href = row.original.href;
              return (
              // Toda la fila abre el día con el mouse; con teclado, el botón de la última columna.
              // Sin href: el día queda antes de lo que acepta la vista del día (2 años exactos).
              <tr
                key={row.id}
                onClick={href ? (e) => !(e.target as HTMLElement).closest("a, button") && router.push(href) : undefined}
                className={href ? "group cursor-pointer hover:bg-mufin-bg" : undefined}
              >
                {row.getVisibleCells().map((c) => (
                  <td key={c.id} className={`py-1 pr-4 align-middle first:pl-2 last:pr-2 ${RIGHT.has(c.column.id) ? "text-right" : ""}`}>
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* En el celular, como en el día: cada fila es una tarjeta que abre el día. */}
      <ul className="mt-4 divide-y divide-mufin-border text-sm lg:hidden">
        {sorted.map(({ original: r }) => {
          const grid = "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-3";
          const body = (
            <>
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-3">
                  <span className={`font-medium ${r.empty ? "text-muted" : "text-mufin-ink"}`}>
                    {r.label}
                    {r.best && <Best />}
                  </span>
                  <span className={`font-semibold tabular-nums ${r.amount ? "text-mufin-ink" : "text-muted"}`}>{formatClp(r.amount)}</span>
                </span>
                <span className="mt-1 block text-muted tabular-nums">
                  {r.empty ? "Sin ventas" : `${sales(r.count)}, efectivo ${formatClp(r.cash)}, tarjeta ${formatClp(r.card)}`}
                </span>
              </span>
              {r.href && (
                <span className="self-center text-muted">
                  <Chevron />
                </span>
              )}
            </>
          );
          return (
            <li key={r.date}>
              {r.href ? (
                <Link href={r.href} aria-label={`${r.label}, ver ventas del día`} className={`${grid} -mx-2 rounded-xl px-2 hover:bg-mufin-bg ${focus}`}>
                  {body}
                </Link>
              ) : (
                <div className={grid}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <Pager table={table} total={rows.length} bottom anchor="dias" label="días" />
    </>
  );
}

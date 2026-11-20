"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type SortingState, type Table } from "@tanstack/react-table";
import type { DayView } from "@/lib/portal/day";
import { formatClp } from "@/lib/portal/sales";
import BrandMark, { hasBrand } from "./BrandMark";

type Row = DayView["rows"][number];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

function Dot({ card }: { card: boolean }) {
  return <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${card ? "bg-mufin-700" : "bg-accent-500"}`} />;
}

// Con logo no va el nombre: el logo lo dice. El nombre queda para lectores de pantalla y al pasar el mouse.
function Brand({ name, size = "h-8 w-8" }: { name: string | null; size?: string }) {
  if (!name) return <span className="text-muted">—</span>;
  if (!hasBrand(name)) return <span className="text-muted">{name}</span>;
  return (
    <span title={name} className="inline-flex">
      <BrandMark name={name} size={size} />
      <span className="sr-only">{name}</span>
    </span>
  );
}

function Amount({ r }: { r: Row }) {
  return (
    <span className={`font-semibold tabular-nums ${r.voided ? "text-muted line-through" : r.negative ? "text-warn-700" : "text-mufin-ink"}`}>
      {formatClp(r.amount)}
    </span>
  );
}

const ventaHref = (detail: string, r: Row) => (r.uuid ? `${detail}&venta=${encodeURIComponent(r.uuid)}` : null);

export function Chevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
      <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const muted = (v: string | null) => <span className="text-muted">{v ?? "—"}</span>;
const money = (v: number) => <span className={`tabular-nums ${v ? "text-mufin-ink" : "text-muted"}`}>{v ? formatClp(v) : "—"}</span>;

const col = createColumnHelper<Row>();
// Las columnas de propina y efectivo entregado aparecen solo si alguna venta del día las tiene.
const makeColumns = (detail: string, tips: boolean, cashback: boolean) => [
  col.accessor("time", { header: "Hora", cell: (c) => <span className="text-muted tabular-nums">{c.getValue()}</span> }),
  col.accessor("docType", {
    header: "Documento",
    cell: (c) => (
      <span className={c.row.original.voided ? "text-muted" : "text-mufin-ink"}>
        {c.getValue()}
        {c.row.original.voided && <span className="ml-2 rounded-full bg-mufin-bg px-2 py-0.5 text-xs text-muted">Anulada</span>}
      </span>
    ),
  }),
  col.accessor("folio", {
    header: "N°",
    cell: (c) => <span className={`font-medium tabular-nums ${c.row.original.voided ? "text-muted line-through" : "text-mufin-ink"}`}>{c.getValue()}</span>,
  }),
  col.accessor("medio", {
    header: "Medio",
    cell: (c) => (
      <span className="flex items-center gap-2 text-mufin-ink">
        <Dot card={c.row.original.isCard} />
        {c.getValue()}
      </span>
    ),
  }),
  col.accessor((r) => r.brand ?? "", { id: "brand", header: "Marca", cell: (c) => <Brand name={c.row.original.brand} /> }),
  col.accessor((r) => r.last4 ?? "", { id: "last4", header: "Tarjeta", cell: (c) => <span className="tabular-nums">{muted(c.row.original.last4)}</span> }),
  col.accessor((r) => r.subsidiary ?? "", { id: "subsidiary", header: "Sucursal", cell: (c) => muted(c.row.original.subsidiary) }),
  col.accessor("tid", { header: "Equipo", cell: (c) => <span className="text-muted tabular-nums">{c.getValue()}</span> }),
  ...(tips ? [col.accessor("tip", { header: "Propina", cell: (c) => money(c.getValue()) })] : []),
  ...(cashback ? [col.accessor("cashback", { header: "Efectivo entregado", cell: (c) => money(c.getValue()) })] : []),
  col.accessor("amount", { header: "Monto", cell: (c) => <Amount r={c.row.original} /> }),
  col.display({
    id: "detail",
    header: () => <span className="sr-only">Detalle</span>,
    cell: (c) => {
      const href = ventaHref(detail, c.row.original);
      return (
        href && (
          <Link
            href={href}
            scroll={false}
            aria-label={`Ver detalle de ${c.row.original.document}`}
            title="Ver detalle"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-muted group-hover:bg-white group-hover:text-mufin-700 hover:text-mufin-700 ${focus}`}
          >
            <Chevron />
          </Link>
        )
      );
    },
  }),
];

const RIGHT = new Set(["amount", "tip", "cashback", "folio"]);

// Flecha doble tenue = se puede ordenar; flecha sola = orden actual.
function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 16" className={`h-3.5 w-3 fill-current ${dir ? "" : "opacity-40"}`}>
      {dir !== "desc" && <path d="M6 2 10 7H2z" />}
      {dir !== "asc" && <path d="M6 14 2 9h8z" />}
    </svg>
  );
}

const PAGE = 25;

// Al cambiar de página se vuelve al inicio de la lista: los controles están abajo.
function Pager({ table, total }: { table: Table<Row>; total: number }) {
  if (table.getPageCount() <= 1) return null;
  const { pageIndex } = table.getState().pagination;
  const from = pageIndex * PAGE + 1;
  const to = Math.min(from + PAGE - 1, total);
  const go = (fn: () => void) => {
    fn();
    document.getElementById("ventas")?.scrollIntoView({ block: "start" });
  };
  const btn = `inline-flex h-11 items-center rounded-xl border border-mufin-border bg-white px-4 text-sm font-semibold text-mufin-ink hover:border-mufin-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-mufin-border ${focus}`;
  return (
    <nav aria-label="Páginas de ventas" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-mufin-border pt-4 text-sm">
      <p className="text-muted tabular-nums" aria-live="polite">
        Ventas {from.toLocaleString("es-CL")} a {to.toLocaleString("es-CL")} de {total.toLocaleString("es-CL")}, página {pageIndex + 1} de {table.getPageCount()}
      </p>
      <span className="flex gap-2">
        <button type="button" className={btn} disabled={!table.getCanPreviousPage()} onClick={() => go(table.previousPage)}>
          Anterior
        </button>
        <button type="button" className={btn} disabled={!table.getCanNextPage()} onClick={() => go(table.nextPage)}>
          Siguiente
        </button>
      </span>
    </nav>
  );
}

// Ordena y pagina en el navegador sobre lo que trajo tomahawk (hasta 500 ventas, casi siempre el día completo).
// Al ordenar o cambiar de día, TanStack vuelve a la página 1.
// `detail`: la URL actual del día; la fila le agrega &venta= para abrir el panel.
export default function SalesTable({ rows, detail }: { rows: Row[]; detail: string }) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const tips = rows.some((r) => r.tip > 0);
  const cashback = rows.some((r) => r.cashback > 0);
  const columns = useMemo(() => makeColumns(detail, tips, cashback), [detail, tips, cashback]);
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: PAGE } },
    getRowId: (r) => r.key,
  });
  const sorted = table.getRowModel().rows;

  return (
    <>
      {/* overflow-x-auto: con propina y efectivo entregado son 12 columnas; en pantallas medianas se desplaza dentro del recuadro. */}
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
              const href = ventaHref(detail, row.original);
              return (
                // Toda la fila abre el detalle con el mouse; con teclado, el botón de la última columna.
                <tr
                  key={row.id}
                  onClick={href ? (e) => !(e.target as HTMLElement).closest("a, button") && router.push(href, { scroll: false }) : undefined}
                  className={href ? "group cursor-pointer hover:bg-mufin-bg" : undefined}
                >
                  {row.getVisibleCells().map((c) => (
                    <td key={c.id} className={`py-2 pr-4 align-middle first:pl-2 last:pr-2 ${RIGHT.has(c.column.id) ? "text-right" : ""}`}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* En el celular la tabla no cabe: cada venta es una tarjeta que abre el detalle. */}
      <ul className="mt-4 divide-y divide-mufin-border text-sm lg:hidden">
        {sorted.map(({ original: r }) => {
          const href = ventaHref(detail, r);
          const body = (
            <>
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-3">
                  <span className={`font-medium ${r.voided ? "text-muted line-through" : "text-mufin-ink"}`}>
                    {r.docType} N° {r.folio}
                  </span>
                  <Amount r={r} />
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                  <span className="tabular-nums">{r.time}</span>
                  <span className="flex items-center gap-2 text-mufin-ink">
                    {hasBrand(r.brand) ? <Brand name={r.brand} size="-my-1 h-6 w-6" /> : <Dot card={r.isCard} />}
                    {r.medio}
                    {r.last4 && <span className="tabular-nums text-muted">{r.last4}</span>}
                  </span>
                  {r.voided && <span className="rounded-full bg-mufin-bg px-2 py-0.5 text-xs">Anulada</span>}
                </span>
                <span className="mt-0.5 block break-words text-muted">{r.place}</span>
              </span>
              {href && (
                <span className="self-center text-muted">
                  <Chevron />
                </span>
              )}
            </>
          );
          const grid = "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 py-3";
          return (
            <li key={r.key}>
              {href ? (
                <Link href={href} scroll={false} aria-label={`${r.document}, ver detalle`} className={`${grid} -mx-2 rounded-xl px-2 hover:bg-mufin-bg ${focus}`}>
                  {body}
                </Link>
              ) : (
                <div className={grid}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      <Pager table={table} total={rows.length} />
    </>
  );
}

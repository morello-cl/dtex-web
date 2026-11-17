"use client";

import { useState } from "react";
import Link from "next/link";
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type SortingState } from "@tanstack/react-table";
import type { DayView } from "@/lib/portal/day";
import { formatClp } from "@/lib/portal/sales";

type Row = DayView["rows"][number];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

function MethodDot({ card }: { card: boolean }) {
  return <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${card ? "bg-mufin-700" : "bg-accent-500"}`} />;
}

function Document({ r, detail }: { r: Row; detail: string }) {
  const text = <span className={r.voided ? "text-muted line-through" : "text-mufin-ink"}>{r.document}</span>;
  return (
    <span className="font-medium">
      {r.uuid ? (
        <Link href={`${detail}&venta=${encodeURIComponent(r.uuid)}`} scroll={false} className={`rounded underline decoration-mufin-300 underline-offset-4 hover:decoration-mufin-700 ${focus}`}>
          {text}
        </Link>
      ) : (
        text
      )}
      {r.voided && <span className="ml-2 rounded-full bg-mufin-bg px-2 py-0.5 text-xs font-normal text-muted">Anulada</span>}
    </span>
  );
}

function Amount({ r }: { r: Row }) {
  return (
    <span className="text-right">
      <span className={`block font-semibold tabular-nums ${r.voided ? "text-muted line-through" : r.negative ? "text-warn-700" : "text-mufin-ink"}`}>
        {formatClp(r.amount)}
      </span>
      {r.tip > 0 && <span className="block text-xs text-muted tabular-nums">propina {formatClp(r.tip)}</span>}
      {r.cashback > 0 && <span className="block text-xs text-muted tabular-nums">efectivo entregado {formatClp(r.cashback)}</span>}
    </span>
  );
}

const col = createColumnHelper<Row>();
const makeColumns = (detail: string) => [
  col.accessor("time", { header: "Hora", cell: (c) => <span className="text-muted tabular-nums">{c.getValue()}</span> }),
  col.accessor("document", { header: "Documento", cell: (c) => <Document r={c.row.original} detail={detail} /> }),
  col.accessor("method", {
    header: "Medio de pago",
    cell: (c) => (
      <span className="flex items-center gap-2 text-muted">
        <MethodDot card={c.row.original.isCard} />
        {c.getValue()}
      </span>
    ),
  }),
  col.accessor("place", { header: "Sucursal y equipo", enableSorting: false, cell: (c) => <span className="break-words text-muted">{c.getValue()}</span> }),
  col.accessor("amount", { header: "Monto", cell: (c) => <Amount r={c.row.original} /> }),
];

const ARROW: Record<string, string> = { asc: " ▲", desc: " ▼" };

// ponytail: ordena solo la página cargada (tomahawk pagina con cursor); ordenar el día completo exige que tomahawk ordene.
// `detail`: la URL actual del día; la fila le agrega &venta= para abrir el panel.
export default function SalesTable({ rows, detail }: { rows: Row[]; detail: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columns] = useState(() => makeColumns(detail));
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (r) => r.key,
  });
  const sorted = table.getRowModel().rows;

  return (
    <>
      <table className="mt-4 hidden w-full text-sm lg:table">
        <thead>
          {table.getHeaderGroups().map((g) => (
            <tr key={g.id} className="border-b border-mufin-border text-left">
              {g.headers.map((h) => {
                const dir = h.column.getIsSorted();
                return (
                  <th
                    key={h.id}
                    scope="col"
                    aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined}
                    className={`py-2 pr-4 font-medium text-muted last:pr-0 ${h.column.id === "amount" ? "text-right" : ""}`}
                  >
                    {h.column.getCanSort() ? (
                      <button type="button" onClick={h.column.getToggleSortingHandler()} className={`rounded hover:text-mufin-ink ${focus}`}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {ARROW[dir || ""] ?? ""}
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
          {sorted.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((c) => (
                <td key={c.id} className={`py-3 pr-4 align-middle last:pr-0 ${c.column.id === "amount" ? "text-right" : ""}`}>
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* En el celular una tabla de 5 columnas no cabe: la misma fila, como tarjeta. */}
      <ul className="mt-4 divide-y divide-mufin-border text-sm lg:hidden">
        {sorted.map(({ original: r }) => (
          <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 py-3">
            <Document r={r} detail={detail} />
            <span className="row-span-2">
              <Amount r={r} />
            </span>
            <span className="text-muted tabular-nums">{r.time}</span>
            <span className="col-span-2 flex items-center gap-2 text-muted">
              <MethodDot card={r.isCard} />
              {r.method}
            </span>
            <span className="col-span-2 break-words text-muted">{r.place}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

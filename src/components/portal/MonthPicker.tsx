"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MONTHS } from "@/lib/portal/day";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";
const square = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-mufin-border bg-white text-mufin-ink hover:border-mufin-700 ${focus}`;
const off = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-mufin-border bg-white text-mufin-ink opacity-40";
const href = (m: string) => `/portal/ventas?mes=${m}`;

function Arrow({ back }: { back?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
      <path d={back ? "m12 5-5 5 5 5" : "m8 5 5 5-5 5"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Flechas ‹ › para el mes vecino y un panel con los 12 meses del año: sin desplazamiento
// horizontal, que con mouse en Windows es incómodo. `min`/`max` (YYYY-MM) son el rango del §7.
export default function MonthPicker({ month, min, max, prev, next }: { month: string; min: string; max: string; prev: string | null; next: string | null }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(Number(month.slice(0, 4)));
  const box = useRef<HTMLDivElement>(null);
  const name = MONTHS[Number(month.slice(5, 7)) - 1];
  const label = `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${month.slice(0, 4)}`;

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  const minYear = Number(min.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));

  return (
    <nav aria-label="Elegir mes" className="flex items-center gap-2">
      {prev ? (
        <Link href={href(prev)} scroll={false} aria-label="Mes anterior" title="Mes anterior" className={square}>
          <Arrow back />
        </Link>
      ) : (
        <span aria-hidden="true" className={off}>
          <Arrow back />
        </span>
      )}
      <div ref={box} className="relative">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            setYear(Number(month.slice(0, 4)));
            setOpen((o) => !o);
          }}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border border-mufin-border bg-white px-4 text-sm font-semibold text-mufin-ink hover:border-mufin-700 ${focus}`}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-mufin-700" strokeWidth="1.6">
            <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
            <path d="M3 8.5h14M7 2.5v4M13 2.5v4" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Elegir otro mes, mes elegido:</span>
          {label}
        </button>
        {open && (
          <div
            role="dialog"
            aria-label="Elegir mes"
            className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-mufin-border bg-white p-3 shadow-[0_20px_40px_-20px_rgba(3,0,20,0.35)]"
          >
            <div className="flex items-center justify-between">
              <button type="button" aria-label="Año anterior" disabled={year <= minYear} onClick={() => setYear(year - 1)} className={`${square} h-9 w-9 disabled:opacity-40 disabled:hover:border-mufin-border`}>
                <Arrow back />
              </button>
              <p className="font-semibold text-mufin-ink tabular-nums" aria-live="polite">
                {year}
              </p>
              <button type="button" aria-label="Año siguiente" disabled={year >= maxYear} onClick={() => setYear(year + 1)} className={`${square} h-9 w-9 disabled:opacity-40 disabled:hover:border-mufin-border`}>
                <Arrow />
              </button>
            </div>
            <ol className="mt-3 grid grid-cols-4 gap-1.5">
              {MONTHS.map((n, i) => {
                const m = `${year}-${String(i + 1).padStart(2, "0")}`;
                const short = `${n.charAt(0).toUpperCase()}${n.slice(1, 3)}`;
                const cell = "flex h-10 items-center justify-center rounded-[10px] text-sm";
                return (
                  <li key={m}>
                    {m < min || m > max ? (
                      <span className={`${cell} text-muted opacity-50`} title="Fuera del período disponible">
                        {short}
                      </span>
                    ) : (
                      <Link
                        href={href(m)}
                        scroll={false}
                        onClick={() => setOpen(false)}
                        aria-current={m === month ? "date" : undefined}
                        aria-label={`${n} de ${year}`}
                        className={`${cell} font-semibold ${focus} ${m === month ? "bg-mufin-700 text-white" : "text-mufin-ink hover:bg-mufin-bg"}`}
                      >
                        {short}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 border-t border-mufin-border pt-2 text-center text-xs text-muted">Puedes revisar hasta 2 años atrás.</p>
          </div>
        )}
      </div>
      {next ? (
        <Link href={href(next)} scroll={false} aria-label="Mes siguiente" title="Mes siguiente" className={square}>
          <Arrow />
        </Link>
      ) : (
        <span aria-hidden="true" className={off}>
          <Arrow />
        </span>
      )}
    </nav>
  );
}

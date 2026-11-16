"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700";

// Fechas YYYY-MM-DD como día local, sin pasar por UTC (el 1 de un mes no se corre al 31).
const toDate = (iso: string) => new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8)));
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const label = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric" });

export default function DateField({ date, min, max, medio }: { date: string; min: string; max: string; medio: string | null }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  function pick(d: Date | undefined) {
    if (!d) return;
    setOpen(false);
    const q = new URLSearchParams({ fecha: toIso(d) });
    if (medio) q.set("medio", medio);
    router.push(`/portal/ventas?${q}`, { scroll: false });
  }

  return (
    <div ref={box} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border border-mufin-border bg-white px-4 text-sm font-semibold text-mufin-900 hover:border-mufin-700 ${focus}`}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-mufin-700" strokeWidth="1.6">
          <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
          <path d="M3 8.5h14M7 2.5v4M13 2.5v4" strokeLinecap="round" />
        </svg>
        <span className="sr-only">Elegir otro día, día elegido:</span>
        {label.format(toDate(date))}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Elegir día"
          className="absolute left-0 z-20 mt-2 rounded-2xl border border-mufin-border bg-white p-3 shadow-[0_20px_40px_-20px_rgba(3,0,20,0.35)]"
        >
          <DayPicker
            mode="single"
            locale={es}
            autoFocus
            selected={toDate(date)}
            defaultMonth={toDate(date)}
            onSelect={pick}
            startMonth={toDate(min)}
            endMonth={toDate(max)}
            disabled={[{ before: toDate(min) }, { after: toDate(max) }]}
            captionLayout="dropdown"
            // Colores y esquinas en globals.css (.rdp-root): style.css de react-day-picker no va en capa y le gana a Tailwind.
          />
        </div>
      )}
    </div>
  );
}

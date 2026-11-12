import Link from "next/link";
import {
  COMPARE_LABELS,
  formatClp,
  formatDelta,
  type CompareKey,
  type Dashboard as Data,
} from "@/lib/portal/sales";

const box = "rounded-2xl border border-mufin-border bg-white";

// Alzas en turquesa, bajas en ámbar: nunca rojo, una baja no es un error.
function Delta({ value, size = "sm" }: { value: number | null; size?: "sm" | "lg" }) {
  if (value === null) return <span className="text-muted tabular-nums">—</span>;
  const r = Math.round(value * 10) / 10;
  const tone = r > 0 ? "bg-accent-50 text-accent-600" : r < 0 ? "bg-warn-50 text-warn-700" : "bg-mufin-bg text-muted";
  const pad = size === "lg" ? "px-2.5 py-1 text-base" : "px-2 py-0.5 text-xs";
  return <span className={`rounded-full font-semibold tabular-nums ${tone} ${pad}`}>{formatDelta(value)}</span>;
}

function CompareChips({ vs }: { vs: CompareKey }) {
  return (
    <nav aria-label="Comparar con" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted">Comparar con</span>
      {(Object.keys(COMPARE_LABELS) as CompareKey[]).map((k) => {
        const on = k === vs;
        return (
          <Link
            key={k}
            href={`?vs=${k}`}
            scroll={false}
            aria-current={on ? "true" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700 ${
              on ? "bg-mufin-700 text-white" : "border border-mufin-border bg-white text-mufin-900 hover:border-mufin-700"
            }`}
          >
            {COMPARE_LABELS[k]}
          </Link>
        );
      })}
    </nav>
  );
}

function DayBars({ d }: { d: Data }) {
  const W = 100; // ancho de cada día en el viewBox
  const H = 180; // alto útil de las barras
  const label = `Últimos 7 días contra ${d.compareLabel.toLowerCase()}: ${d.days
    .map((x) => `${x.date} ${formatClp(x.current)} contra ${formatClp(x.previous)}`)
    .join(", ")}.`;
  return (
    <section className={`${box} p-5 sm:p-6 lg:col-span-3`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-mufin-900">Día por día</h2>
        <p className="flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-mufin-900" aria-hidden="true" />
            Últimos 7 días
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-mufin-300" aria-hidden="true" />
            {d.compareLabel}
          </span>
        </p>
      </div>
      <svg viewBox={`0 0 ${W * 7} ${H}`} role="img" aria-label={label} className="mt-5 w-full">
        <line x1="0" x2={W * 7} y1={H} y2={H} className="stroke-mufin-border" strokeWidth="1" />
        {d.days.map((x, i) => {
          const ph = (x.previousHeight / 100) * H;
          const ch = (x.currentHeight / 100) * H;
          const cx = i * W + W / 2;
          return (
            <g key={i}>
              <rect x={cx - 30} y={H - ph} width="28" height={ph} rx="3" className="fill-mufin-300" />
              <rect
                x={cx + 2}
                y={H - ch}
                width="28"
                height={ch}
                rx="3"
                className={x.isToday ? "fill-mufin-700" : "fill-mufin-900"}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-7 text-center text-xs" aria-hidden="true">
        {d.days.map((x, i) => (
          <span key={i} className={x.isToday ? "font-bold text-mufin-900" : "text-muted"}>
            {x.isToday ? "hoy" : x.label}
          </span>
        ))}
      </div>
      <p className="mt-4 border-t border-mufin-border pt-4 text-sm text-mufin-900">{d.today}</p>
    </section>
  );
}

function CompareRuler({ d, vs }: { d: Data; vs: CompareKey }) {
  return (
    <section className={`${box} p-5 sm:p-6 lg:col-span-2`}>
      <h2 className="font-semibold text-mufin-900">Contra otros períodos</h2>
      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 text-sm">
        <span />
        <div className="relative h-5">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-mufin-900"
            style={{ left: `${Math.min(Math.max(d.rulerCurrentAt, 15), 85)}%` }}
          >
            esta semana
          </span>
        </div>
        <span />
        {d.ruler.map((r) => (
          <div key={r.key} className="contents">
            <span
              className={`whitespace-nowrap py-2.5 ${r.key === vs ? "font-semibold text-mufin-900" : "text-muted"}`}
            >
              {r.label}
            </span>
            {r.total === null ? (
              <span className="col-span-2 py-2.5 text-xs text-muted">Aún no vendías con DTEx®</span>
            ) : (
              <>
                <div className="relative self-stretch py-2.5">
                  <div
                    className={`h-3 rounded-sm ${r.key === vs ? "bg-mufin-300" : "bg-mufin-300/50"}`}
                    style={{ width: `${r.width}%` }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 w-0.5 bg-mufin-900"
                    style={{ left: `${d.rulerCurrentAt}%` }}
                  />
                </div>
                <span className="text-right text-xs tabular-nums text-mufin-900">{formatClp(r.total)}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-mufin-border pt-4 text-sm text-mufin-900">{d.rulerReading}</p>
    </section>
  );
}

function KpiStrip({ d }: { d: Data }) {
  const k = d.kpis;
  const cell = "p-5";
  const name = "text-sm text-muted";
  const value = "mt-1 text-2xl font-bold tabular-nums text-mufin-900";
  return (
    <section
      aria-label="Indicadores de los últimos 7 días"
      className={`${box} grid divide-y divide-mufin-border lg:grid-cols-4 lg:divide-x lg:divide-y-0`}
    >
      <div className={cell}>
        <p className={name}>Cantidad de ventas</p>
        <p className={`${value} flex items-center gap-2`}>
          {k.count.toLocaleString("es-CL")} <Delta value={k.countDelta} />
        </p>
      </div>
      <div className={cell}>
        <p className={name}>Ticket promedio</p>
        <p className={`${value} flex items-center gap-2`}>
          {formatClp(k.ticket)} <Delta value={k.ticketDelta} />
        </p>
      </div>
      <div className={cell}>
        <p className={name}>Con tarjeta</p>
        <p className={value}>{k.cardShare}%</p>
        <div className="mt-2 h-1.5 rounded-full bg-mufin-bg" aria-hidden="true">
          <div className="h-1.5 rounded-full bg-mufin-700" style={{ width: `${k.cardShare}%` }} />
        </div>
      </div>
      <div className={cell}>
        <p className={name}>Hora de más venta</p>
        <p className={value}>{k.peakHour ?? "—"}</p>
      </div>
    </section>
  );
}

export default function Dashboard({ d, vs }: { d: Data; vs: CompareKey }) {
  if (d.empty) {
    return (
      <section className={`${box} px-6 py-16 text-center`}>
        <h1 className="text-2xl font-bold text-mufin-900">Aún no tienes ventas con DTEx®</h1>
        <p className="mt-2 text-muted">Cuando cobres tu primera venta, aquí verás cómo va tu semana.</p>
      </section>
    );
  }
  const k = d.kpis;
  const parts = [`Ventas ${formatClp(k.sale)}`, `propinas ${formatClp(k.tip)}`];
  // Cashback: extra cobrado con tarjeta y entregado en efectivo. El vuelto en efectivo no entra.
  if (k.cashback) parts.push(`efectivo entregado con tarjeta ${formatClp(k.cashback)}`);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-sm font-medium text-muted">Vendido en los últimos 7 días</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-5xl font-extrabold tracking-tight text-mufin-900 tabular-nums">
            {formatClp(d.total)}
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <Delta value={d.delta} size="lg" />
            {d.delta === null ? "sin datos para comparar" : `contra ${d.compareLabel.toLowerCase()}`}
          </span>
        </p>
        <p className="mt-2 text-sm text-muted tabular-nums">{parts.join(", ")}.</p>
        <p className="mt-1 text-sm text-muted">Período {d.rangeLabel}.</p>
      </header>
      <CompareChips vs={vs} />
      <div className="grid gap-6 lg:grid-cols-5">
        <DayBars d={d} />
        <CompareRuler d={d} vs={vs} />
      </div>
      <KpiStrip d={d} />
    </div>
  );
}

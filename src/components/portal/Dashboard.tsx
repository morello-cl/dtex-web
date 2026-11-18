import Link from "next/link";
import BrandMark from "./BrandMark";
import type { CardsView, Slice, Tip } from "@/lib/portal/cards";
import {
  COMPARE_LABELS,
  formatClp,
  formatDelta,
  type CompareKey,
  type Dashboard as Data,
} from "@/lib/portal/sales";

const box = "rounded-2xl border border-mufin-border bg-white";
const hint = "mt-1 text-sm text-muted";

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
            className={`inline-flex h-[38px] items-center rounded-[10px] px-3.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700 ${
              on ? "bg-mufin-700 text-white" : "border border-mufin-border bg-white text-mufin-ink hover:border-mufin-700"
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
        <div>
          <h2 className="font-semibold text-mufin-ink">Día por día</h2>
          <p className={hint}>Lo cobrado cada día, junto al mismo día de la semana del período que comparas.</p>
        </div>
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
      <nav aria-label="Ver ventas del día" className="mt-2 grid grid-cols-7 text-center text-xs">
        {d.days.map((x) => (
          <Link
            key={x.iso}
            href={`/portal/ventas?fecha=${x.iso}`}
            aria-label={`Ver ventas del ${x.date}`}
            className={`rounded-md py-1 hover:bg-mufin-bg hover:underline focus-visible:outline-2 focus-visible:outline-mufin-700 ${x.isToday ? "font-bold text-mufin-ink" : "text-muted"}`}
          >
            {x.isToday ? "hoy" : x.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4 border-t border-mufin-border pt-4 text-sm text-mufin-ink">{d.today}</p>
    </section>
  );
}

function CompareRuler({ d, vs }: { d: Data; vs: CompareKey }) {
  return (
    <section className={`${box} p-5 sm:p-6 lg:col-span-2`}>
      <h2 className="font-semibold text-mufin-ink">Contra otros períodos</h2>
      <p className={hint}>Cada barra es lo vendido en 7 días de ese período; la línea marca lo que llevas esta semana.</p>
      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 text-sm">
        <span />
        <div className="relative h-5">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-mufin-ink"
            style={{ left: `${Math.min(Math.max(d.rulerCurrentAt, 15), 85)}%` }}
          >
            esta semana
          </span>
        </div>
        <span />
        {d.ruler.map((r) => (
          <div key={r.key} className="contents">
            <span
              className={`whitespace-nowrap py-2.5 ${r.key === vs ? "font-semibold text-mufin-ink" : "text-muted"}`}
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
                <span className="text-right text-xs tabular-nums text-mufin-ink">{formatClp(r.total)}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-mufin-border pt-4 text-sm text-mufin-ink">{d.rulerReading}</p>
    </section>
  );
}

function KpiStrip({ d }: { d: Data }) {
  const k = d.kpis;
  const cell = "p-5";
  const name = "text-sm text-muted";
  const value = "mt-1 text-2xl font-bold tabular-nums text-mufin-ink";
  const why = "mt-2 text-xs text-muted";
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
        <p className={why}>Boletas y facturas emitidas en los 7 días.</p>
      </div>
      <div className={cell}>
        <p className={name}>Ticket promedio</p>
        <p className={`${value} flex items-center gap-2`}>
          {formatClp(k.ticket)} <Delta value={k.ticketDelta} />
        </p>
        <p className={why}>Lo que gasta en promedio cada cliente por compra.</p>
      </div>
      <div className={cell}>
        <p className={name}>Con tarjeta</p>
        <p className={value}>{k.cardShare}%</p>
        <div className="mt-2 h-1.5 rounded-full bg-mufin-bg" aria-hidden="true">
          <div className="h-1.5 rounded-full bg-mufin-700" style={{ width: `${k.cardShare}%` }} />
        </div>
        <p className={why}>Parte del total cobrada con tarjeta; el resto fue en efectivo.</p>
      </div>
      <div className={cell}>
        <p className={name}>Hora de más venta</p>
        <p className={value}>{k.peakHour ?? "—"}</p>
        <p className={why}>La hora del día en que más vendiste en los 7 días.</p>
      </div>
    </section>
  );
}

// Colores de la marca en orden de contraste: dos trozos vecinos nunca se confunden.
const SLICE = ["var(--mufin-900)", "var(--accent-500)", "var(--mufin-700)", "var(--warn-200)", "var(--mufin-300)", "var(--accent-400)"];

function Donut({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((a, s) => a + s.amount, 0);
  const lens = slices.map((s) => (100 * s.amount) / total);
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, l) => a + l, 0));
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <svg viewBox="0 0 42 42" role="img" aria-label={`${title}: ${slices.map((s) => `${s.label} ${s.pct}%`).join(", ")}.`} className="h-36 w-36 shrink-0 -rotate-90">
        {slices.map((s, i) => (
          <circle key={s.key} cx="21" cy="21" r="15.9155" fill="none" strokeWidth="7" pathLength="100"
            stroke={SLICE[i % SLICE.length]} strokeDasharray={`${lens[i]} ${100 - lens[i]}`} strokeDashoffset={-starts[i]} />
        ))}
      </svg>
      {/* La leyenda lleva % y monto: el color nunca es el único dato. */}
      <ul className="w-full space-y-2 text-sm">
        {slices.map((s, i) => (
          <li key={s.key} className="flex items-baseline justify-between gap-3">
            <span className="flex items-center gap-2 text-mufin-ink">
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: SLICE[i % SLICE.length] }} />
              {s.label}
            </span>
            <span className="whitespace-nowrap tabular-nums">
              <span className="font-semibold text-mufin-ink">{s.pct}%</span>
              <span className="ml-2 text-muted">{formatClp(s.amount)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cards({ c }: { c: CardsView }) {
  return (
    <section aria-labelledby="tarjetas" className="grid gap-6 lg:grid-cols-2">
      <div className={`${box} p-5 sm:p-6`}>
        <h2 id="tarjetas" className="font-semibold text-mufin-ink">Tipo de tarjeta</h2>
        <p className={hint}>Cómo pagaron tus clientes con tarjeta en los últimos 7 días. Débito y crédito tienen distinta comisión.</p>
        <div className="mt-5">
          <Donut title="Tipo de tarjeta" slices={c.types} />
        </div>
        {c.brands.length > 0 && (
          <ul aria-label="Marcas" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-mufin-border pt-4 text-sm">
            {c.brands.map((b) => (
              <li key={b.key} className="flex items-center gap-2 text-mufin-ink">
                <BrandMark name={b.label} />
                {b.label} <span className="font-semibold tabular-nums">{b.pct}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={`${box} p-5 sm:p-6`}>
        <h2 className="font-semibold text-mufin-ink">Bancos de tus clientes</h2>
        <p className={hint}>El banco que emitió cada tarjeta. Sirve para elegir con qué banco hacer una promoción.</p>
        <div className="mt-5">
          {c.issuers.length ? <Donut title="Bancos" slices={c.issuers} /> : <p className="text-sm text-muted">Aún no hay bancos informados para estos días.</p>}
        </div>
        {(c.pending || c.unknown) && (
          <p className="mt-5 border-t border-mufin-border pt-4 text-xs text-muted">{[c.pending, c.unknown].filter(Boolean).join(" ")}</p>
        )}
      </div>
    </section>
  );
}

function Tips({ tips }: { tips: Tip[] }) {
  return (
    <section aria-labelledby="consejos" className={`${box} p-5 sm:p-6`}>
      <h2 id="consejos" className="font-semibold text-mufin-ink">Recomendaciones para tu negocio</h2>
      <p className={hint}>Calculadas con tus ventas de los últimos 7 días.</p>
      <ul className="mt-4 divide-y divide-mufin-border">
        {tips.map((t) => (
          <li key={t.key} className="py-3">
            <p className="text-mufin-ink">{t.text}</p>
            <p className="mt-1 text-xs text-muted">Según: {t.basis}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Dashboard({ d, vs, cards, tips }: { d: Data; vs: CompareKey; cards: CardsView | null; tips: Tip[] }) {
  if (d.empty) {
    return (
      <section className={`${box} px-6 py-16 text-center`}>
        <h1 className="text-2xl font-bold text-mufin-ink">Aún no tienes ventas con DTEx®</h1>
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
          <span className="text-5xl font-extrabold tracking-tight text-mufin-ink tabular-nums">
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
      {tips.length > 0 && <Tips tips={tips} />}
      {cards && <Cards c={cards} />}
    </div>
  );
}

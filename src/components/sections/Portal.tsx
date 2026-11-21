import Link from "next/link";
import Reveal from "../Reveal";

// Vista previa del Portal de pagos MUFIN con el mismo orden que la pantalla
// real de Ventas (total, medios de pago, propinas) y el próximo abono de
// Abonos. Montos de ejemplo, rotulados como tales: efectivo + tarjeta = total.
const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`;
const DAY = { total: 487320, count: 42, cash: 142800, card: 344520, tips: 6400, payout: 334180 };

const POINTS = [
  { title: "Tus ventas del día", desc: "Efectivo, tarjeta y propinas, venta por venta." },
  { title: "Tus abonos", desc: "Cuánto te depositamos por las ventas con tarjeta y cuándo." },
  { title: "Desde cualquier lugar", desc: "En el celular o el computador, sin estar en el local." },
];

export default function Portal() {
  return (
    <section id="portal" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 md:grid-cols-2 md:items-center">
        <Reveal className="md:order-2">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Revisa tus ventas y tus abonos desde cualquier lugar.
          </h2>
          <p className="mt-4 max-w-lg text-base text-muted">
            Con DTEx® tienes acceso al Portal de pagos MUFIN: lo que vendiste en
            el día y lo que se te deposita, siempre a mano.
          </p>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="var(--brand-700)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  <span className="block font-semibold">{p.title}</span>
                  <span className="block text-sm text-muted">{p.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/portal"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Ir al Portal de pagos
          </Link>
        </Reveal>

        <Reveal delay={120} className="md:order-1">
          <figure className="rounded-3xl border border-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(74,26,122,0.35)] sm:p-6">
            <div aria-hidden="true">
              <p className="text-sm font-semibold text-foreground">Resumen del día</p>
              <p className="mt-3 text-sm text-muted">Total, {DAY.count} ventas</p>
              <p className="text-4xl font-extrabold tracking-tight tabular-nums">{fmt(DAY.total)}</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
                {[
                  ["Efectivo", DAY.cash],
                  ["Tarjeta", DAY.card],
                  ["Propinas", DAY.tips],
                ].map(([label, n]) => (
                  <div key={label}>
                    <dt className="text-muted">{label}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{fmt(n as number)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-brand-700 px-5 py-4 text-white">
                <span>
                  <span className="block text-sm text-white/80">Próximo abono</span>
                  <span className="block text-2xl font-bold tabular-nums">{fmt(DAY.payout)}</span>
                </span>
                <span className="text-right text-sm text-white/80">Ventas con tarjeta<br />de hoy</span>
              </div>
            </div>
            <figcaption className="mt-4 text-xs text-muted">Ejemplo con montos ficticios.</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

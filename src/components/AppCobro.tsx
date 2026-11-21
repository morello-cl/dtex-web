// Pantalla de cobro de la app DTEx®, redibujada a partir de una captura real
// (dtex_app, Sunmi P3): mismo orden y textos que ve el cajero. Es una
// ilustración y no una captura porque el equipo de prueba estampa un sello de
// firmware TEST y la app de desarrollo lleva la cinta DEBUG. Cuando haya un
// equipo con firmware de producción y un APK release, reemplazar por la captura.
// El comercio es de demostración: nunca poner aquí datos de un comercio real.
const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];
const TABS = ["Total", "Producto", "Sencillito", "Facturación"];

export default function AppCobro() {
  return (
    <figure
      role="img"
      aria-label="Pantalla de cobro de la app DTEx® en un equipo Android: total a cobrar $14.990 y botón Emitir Venta."
      className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px]"
    >
      <div className="rounded-[2.25rem] bg-[#1d1630] p-2.5 shadow-[0_40px_80px_-30px_rgba(74,26,122,0.55)]">
        <div aria-hidden="true" className="overflow-hidden rounded-[1.75rem] bg-[#f7f6fa] text-brand-700">
          <div className="flex items-center gap-4 px-5 pb-3 pt-5">
            <span className="space-y-1">
              <span className="block h-0.5 w-4 rounded bg-foreground" />
              <span className="block h-0.5 w-4 rounded bg-foreground" />
              <span className="block h-0.5 w-4 rounded bg-foreground" />
            </span>
            <span className="text-base font-bold text-foreground">Mi Almacén</span>
          </div>

          <div className="mx-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
            <p className="text-[10px] font-semibold tracking-wide">TOTAL A COBRAR</p>
            <p className="mt-1 text-center text-3xl font-extrabold tabular-nums">$ 14.990</p>
          </div>

          <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <span key={k} className="rounded-xl bg-brand-50/70 py-2 text-center text-lg font-bold">
                {k}
              </span>
            ))}
            <span className="col-start-2 rounded-xl bg-brand-50/70 py-2 text-center text-lg font-bold">0</span>
          </div>

          <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 py-3 text-center text-sm font-bold text-white">
            Emitir Venta
          </div>

          <div className="mt-4 grid grid-cols-4 border-t border-border bg-white px-1 py-2 text-center text-[9px] text-muted">
            {TABS.map((t, i) => (
              <span key={t} className={i === 0 ? "mx-1 rounded-lg bg-brand-700 py-1.5 font-semibold text-white" : "py-1.5"}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="absolute -left-6 bottom-32 rounded-2xl border border-border bg-white px-4 py-3 text-left shadow-lg sm:-left-14">
        <span className="block text-xs text-muted">Boleta electrónica</span>
        <span className="block text-sm font-semibold text-foreground">Enviada al SII</span>
      </figcaption>
    </figure>
  );
}

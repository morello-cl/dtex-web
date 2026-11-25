// Se muestra al instante al cambiar de sección mientras el servidor consulta los datos.
const bar = "rounded-xl bg-mufin-border/60 motion-safe:animate-pulse";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Cargando…</span>
      <div aria-hidden="true" className={`h-8 w-48 ${bar}`} />
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-28 ${bar}`} />
        ))}
      </div>
      <div aria-hidden="true" className={`h-72 ${bar}`} />
    </div>
  );
}

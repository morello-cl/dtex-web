# Portal de pagos: Inicio (proyecto 2). Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que lo primero que vea el comercio al entrar sea cómo van sus ventas
de los últimos 7 días comparadas con cinco períodos anteriores.

**Architecture:** Tomahawk entrega un solo endpoint de agregados
(`sales/summary`) con 6 ventanas de 7 días ya cortadas a la misma hora. Este
repo hace todo el cálculo de presentación en una función pura
(`buildDashboard`), probada con `node:test`, y lo dibuja como Server Component
con SVG hecho a mano. El comparativo elegido viaja en `?vs=`, así que la
pantalla no necesita JS de cliente.

**Tech Stack:** Next.js 16 (Server Components, `searchParams` como Promise),
Tailwind v4, `Intl.NumberFormat("es-CL")` y `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-10-portal-comercios-design.md`, §6
(mockup aprobado: `panel-semana-v3`). Contrato de auth ya implementado:
`docs/portal/contratos.md` §1.

## Global Constraints

- **Ventana:** los últimos 7 días móviles hasta hoy. El día de hoy se compara
  hasta la misma hora.
- **Comparativos y sus etiquetas:**
  - `week_1`: "Semana anterior" (por defecto)
  - `week_2`: "Hace 2 semanas"
  - `week_4`: "Hace 1 mes"
  - `week_8`: "Hace 2 meses"
  - `week_52`: "Hace 1 año"

  Todos se alinean por día de semana.
- **Monto:** incluye todo lo involucrado en el pago, es decir venta, propina
  y cashback. Tomahawk define la suma; el front solo usa `amount`.
- **Período sin datos:** cuando el período termina antes de
  `first_sale_date`, se muestra "Aún no vendías con DTEx®" y **nunca 0%**.
- **Paleta:**
  - morado MUFIN `#2D0D54` para cifras y período actual;
  - `#461FB6` para lo interactivo;
  - lavanda `#C9BFE6` para el período comparado;
  - fondo `#F8F7FB` y bordes `#E4DFF0`;
  - turquesa `accent-500` para las alzas y `warn-700` para las bajas, nunca
    rojo.
- **Sin fondos oscuros** en el panel. Inter con `tabular-nums` en todos los
  montos.
- **Copy:**
  - sin mayúsculas en etiquetas, sin "·" ni "→";
  - sin grillas de tarjetas idénticas: los KPIs van en una sola franja con
    divisores.
- Gráficos en SVG inline, **sin librería** de gráficos y sin dependencias
  nuevas.
- **Próximo abono:** no aparece en este proyecto; se agrega con el proyecto 4.
- **Marca:** logo MUFIN arriba ("Portal de pagos MUFIN") y `PortalFooter` al
  pie, ambos ya existen.
- El `client_uuid` sale del JWT; el front nunca envía un id de comercio.

## Review Focus

1. **Comparativo con 0 ventas:** la variación muestra "—", nunca `Infinity`
   ni `NaN%`. Lo prueba la Task 2.
2. **Período anterior a la primera venta:** la fila dice "Aún no vendías con
   DTEx®", y si ese período está elegido, la cifra principal no muestra
   variación. Lo prueba la Task 2.
3. **Hoy todavía sin ventas** (de madrugada): "Hoy aún no registras ventas.",
   no "$0, 100% menos". Lo prueba la Task 2.
4. **`?vs=` inválido o ausente:** se usa `week_1`. Lo prueba la Task 2.
5. **Todas las ventanas en 0** (comercio recién activado): las barras tienen
   alto 0 y no `NaN`, y se muestra el estado vacío. Lo prueba la Task 2.

---

### Task 1: Contrato de agregados

**Files:**
- Modify: `docs/portal/contratos.md`, nueva sección "2. Inicio".

**Interfaces:**
- Produces: la forma de `SalesSummary` que consume la Task 2.

- [ ] **Step 1: Escribir la sección 2 con exactamente este contrato.** Marcarla
  "pendiente de confirmación de tomahawk" hasta que tomahawk_8 responda las
  preguntas de columnas y estados.

`GET /api/portal/v1/sales/summary`, con el header `x-token-dtex`:

```jsonc
{ "as_of": "2026-11-12T15:04:00-03:00", "first_sale_date": "2026-03-14" | null,
  "windows": { "current": W, "week_1": W, "week_2": W, "week_4": W, "week_8": W, "week_52": W },
  "hourly": [{ "hour": 0, "amount": 0 }, ...] }   // 24 filas, solo de current
// W = { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD",
//       "days": [{ "date", "amount", "count", "card_amount" }] }  // siempre 7, en orden
```

Reglas:
- El último día de cada comparativo se corta a la hora de `as_of`.
- Los montos van en CLP enteros.
- Responde 401 igual que `me`.

- [ ] **Step 2: Commit**

```bash
git add docs/portal/contratos.md
git commit -m "docs(portal): contrato de agregados de ventas para Inicio"
```

---

### Task 2: Cálculo del panel

**Files:**
- Modify: `src/lib/portal/auth.ts`: exportar el `request` interno como
  `portalRequest<T>(path: string, init?: RequestInit): Promise<T>`, sin
  cambiar su comportamiento.
- Create: `src/lib/portal/sales.ts`, sin imports de `next/*`.
- Test: `src/lib/portal/sales.test.ts`

**Interfaces:**
- Produces:
  - `type WindowKey = "current" | "week_1" | "week_2" | "week_4" | "week_8" | "week_52"`
  - `type CompareKey = Exclude<WindowKey, "current">`
  - `type SalesSummary`: la forma del contrato de la Task 1, con nombres
    snake_case tal cual.
  - `getSalesSummary(jwt: string): Promise<SalesSummary>`: usa
    `portalRequest` con `x-token-dtex`. Ante 401 lanza `PortalApiError`
    (la página decide).
  - `parseCompare(raw: string | string[] | undefined): CompareKey`: si el
    valor no es válido, devuelve `"week_1"`.
  - `COMPARE_LABELS: Record<CompareKey, string>`, con las etiquetas de
    Global Constraints.
  - `formatClp(n: number): string`: `"$4.512.900"`.
  - `formatDelta(pct: number | null): string`: `"+9,8%"`, `"-3,1%"`,
    `"0,0%"`; con `null` devuelve `"—"`.
  - `buildDashboard(s: SalesSummary, vs: CompareKey): Dashboard`, donde:

```ts
type Dashboard = {
  empty: boolean;                       // first_sale_date === null
  rangeLabel: string;                   // "del jueves 6 al miércoles 12 a las 15:04"
  total: number;
  delta: number | null;                 // % vs el comparativo elegido; null si 0 o sin datos
  compareLabel: string;
  days: { label: string; current: number; previous: number; isToday: boolean;
          currentHeight: number; previousHeight: number }[]; // altura 0..100, misma escala
  today: string;                        // frase de hoy (ver tests)
  ruler: { key: CompareKey; label: string; total: number | null; width: number }[]; // null = sin datos
  rulerCurrentAt: number;               // 0..100: posición de la línea "esta semana"
  rulerReading: string;
  kpis: { count: number; countDelta: number | null; ticket: number; ticketDelta: number | null;
          cardShare: number; peakHour: string | null };
};
```

- [ ] **Step 1: Escribir los tests que fallan**

Usar un fixture `summary()` armado en el test, con 7 días por ventana y
`as_of` igual a miércoles 2026-11-12 15:04. En `current` el último día suma
412.600 y el total es 4.512.900; en `week_1` el total es 4.110.100.

```ts
test("total y variación contra la semana anterior", () => {
  const d = buildDashboard(summary(), "week_1");
  assert.equal(d.total, 4512900);
  assert.equal(formatClp(d.total), "$4.512.900");
  assert.equal(formatDelta(d.delta), "+9,8%");
});
test("parseCompare: inválido o ausente → week_1", () => {
  assert.equal(parseCompare(undefined), "week_1");
  assert.equal(parseCompare("week_99"), "week_1");
  assert.equal(parseCompare(["week_4"]), "week_4");
});
test("comparativo en 0 → delta null y '—'", ...)              // week_2 con todos los días en 0
test("período antes de first_sale_date → sin datos, nunca 0%", ...)
  // first_sale_date "2026-03-14": week_52 (2025) → ruler[week_52].total === null,
  // y buildDashboard(s, "week_52").delta === null
test("hoy sin ventas → 'Hoy aún no registras ventas.'", ...)
test("hoy con ventas → frase con monto, % y día comparado", ...)
  // "Hoy llevas $412.600, 3,1% menos que el miércoles 5 a esta hora."
test("todo en 0 → empty con first_sale_date null y alturas 0, no NaN", ...)
test("alturas: el máximo de ambas series es 100", ...)
test("lectura de la regla", ...)
  // si solo un período supera al actual: "Solo hace 1 mes vendiste más que ahora."
  // si ninguno lo supera: "Vendiste más que en todos los períodos anteriores."
  // si todos lo superan: "Vendiste menos que en todos los períodos anteriores."
  // si es otro caso: "Vendiste más que en N de M períodos."; M cuenta solo los períodos con datos
test("KPIs: ticket, % tarjeta y hora de más venta", ...)
  // ticket = round(total / count), cardShare = round(100 * card / total),
  // peakHour "12 a 13 h"; con hourly todo en 0 → null
```

- [ ] **Step 2: Correr `npm test` y verificar que falla**

Esperado: FAIL, porque no se encuentra `./sales.ts`.

- [ ] **Step 3: Implementar `sales.ts`**

- `formatClp` usa `Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })`.
  Si el runtime agrega un espacio, normalizarlo a `"$4.512.900"`.
- `formatDelta` usa 1 decimal, coma decimal y signo explícito.
- Los nombres de días salen de un arreglo fijo
  `["domingo","lunes","martes","miércoles","jueves","viernes","sábado"]`,
  aplicado sobre la fecha `YYYY-MM-DD` interpretada como fecha local (sin
  zona horaria). Así se evita el corrimiento de UTC.
- Las barras usan la abreviatura de 3 letras con tilde: "mié", "sáb".

- [ ] **Step 4: Correr `npm test` y verificar que pasa**

Esperado: todos los tests pasan, incluidos los 18 existentes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/portal/auth.ts src/lib/portal/sales.ts src/lib/portal/sales.test.ts
git commit -m "feat(portal): cálculo del panel de los últimos 7 días"
```

---

### Task 3: Pantalla de Inicio

**Files:**
- Create: `src/components/portal/Dashboard.tsx`: Server Component sin
  `"use client"` que recibe `Dashboard` y `vs`. Adentro van `CompareChips`,
  `DayBars` (SVG), `CompareRuler` y `KpiStrip`. Es un solo archivo, porque
  esas piezas solo se usan aquí.
- Modify: `src/app/portal/page.tsx`. Reemplaza la portada provisoria y
  conserva el header con `MufinLogo`, el botón "Cerrar sesión" y
  `PortalFooter`. Ahora el header muestra también `me.merchant.name`.

**Interfaces:**
- Consumes: de la Task 2, `getSalesSummary`, `buildDashboard`, `parseCompare`,
  `COMPARE_LABELS`, `formatClp`, `formatDelta`, y `requireMe` de `session.ts`.

Comportamiento de la página:
- `const vs = parseCompare((await searchParams).vs)`.
- Si `getSalesSummary` lanza: con `isServiceDown` se hace
  `redirect("/portal/mantencion")`; con 401, `redirect("/portal/ingresar")`.
  Los redirects van fuera del `try`.
- Si `empty` es verdadero, en lugar del panel se muestra el título "Aún no
  tienes ventas con DTEx®" y el texto "Cuando cobres tu primera venta, aquí
  verás cómo va tu semana."

Diseño, según el mockup v3:
- **Cabecera de la página:** `rangeLabel` en `text-muted`. La cifra
  principal en `text-5xl font-extrabold text-mufin-900 tabular-nums`, con la
  variación al lado: turquesa si sube, ámbar si baja y sin variación si es
  `null`.
- **Chips:** son `<Link href="?vs=week_2">`. El activo va en `bg-mufin-700
  text-white` y lleva `aria-current="true"`; los demás van blancos con borde.
- **Grilla `lg:grid-cols-5`:**
  - "Día por día" ocupa 3 columnas. Va en SVG con barras pares: lavanda para
    el período comparado y morado para el actual, y el día de hoy en
    `#461FB6` con la etiqueta en negrita. Debajo va la frase `today`.
  - La regla ocupa 2 columnas. Muestra una barra horizontal por comparativo,
    con ancho `width%`, y una línea vertical morada en `rulerCurrentAt%`
    etiquetada "esta semana". Las filas sin datos dicen "Aún no vendías con
    DTEx®". Al pie va `rulerReading`.
- **Franja de KPIs:** una sola caja blanca con divisores, que muestra
  Ventas (con variación), Ticket promedio (con variación), Con tarjeta (con
  una barra de proporción) y Hora de más venta (o "—").
- Cada gráfico SVG lleva `role="img"` y un `aria-label` con los números en
  texto. Por ejemplo: "Últimos 7 días contra semana anterior: jueves
  $612.000 contra $580.000, …".

- [ ] **Step 1: Implementar `Dashboard.tsx` y la página**

- [ ] **Step 2: Correr `npm run lint && npm run build && npm test`**

Esperado: sin errores. `/portal` aparece como ruta dinámica (ƒ).

- [ ] **Step 3: Verificación manual en el preview**

Agregar `sales/summary` al tomahawk falso del scratchpad. Debe usar datos
deterministas, con `first_sale_date` en marzo de 2026, para que `week_52`
salga sin datos.

Luego, con sesión iniciada:
- `/portal` muestra el panel.
- `?vs=week_4` cambia las barras, la cifra y el chip activo.
- `?vs=xx` usa la semana anterior.
- Con el tomahawk falso apagado, va a mantención.
- Con `first_sale_date: null`, muestra el estado vacío.

Revisar a 375 px: la grilla pasa a una columna y la franja de KPIs se apila.

- [ ] **Step 4: Commit**

```bash
git add src/components/portal/Dashboard.tsx src/app/portal/page.tsx
git commit -m "feat(portal): Inicio con los últimos 7 días y cinco comparativos"
```

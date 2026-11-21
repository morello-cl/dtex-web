# Contratos portal de comercios ↔ tomahawk

Diseño: `docs/superpowers/specs/2026-11-10-portal-comercios-design.md`.
Cada proyecto acuerda aquí su contrato antes de construirse.

## 1. Acceso

**Base:** `TOMAHAWK_BASE_URL` (default `https://api.dtex.app`).

**Correo:** el portal envía `email` siempre en minúsculas y sin espacios.

**Sobre de respuesta:** todas las respuestas usan
`{ error, message, data }`. Ante un error, `message` lleva el código.

| Método y ruta | Body | Éxito | Errores |
|---|---|---|---|
| `POST /api/portal/auth/v1/request_link` | `{ email }` | 200 `{ sent: true }`, **siempre**, exista o no el correo | 429 `RATE_LIMITED` `{ retry_after_seconds }` |
| `GET /api/portal/auth/v1/link/{token}` | — | 200 `{ valid: true }`. **No consume el enlace.** | 410 `TOKEN_INVALID` con `data: { reason: "used" \| "expired" }`, o `data: null` si el token no existe |
| `POST /api/portal/auth/v1/set_password` | `{ token, password }` | 200 `{ token: <jwt>, expires_in: <segundos> }` (deja la sesión iniciada) | 410 `TOKEN_INVALID` con el mismo `data` que `link`, 400 `WEAK_PASSWORD` |
| `POST /api/portal/auth/v1/login` | `{ email, password }` | 200 `{ token: <jwt>, expires_in: <segundos> }` | 401 `INVALID_CREDENTIALS` (también si el usuario está inactivo), 423 `ACCOUNT_LOCKED` `{ retry_after_seconds }` |
| `GET /api/portal/v1/me` | header `x-token-dtex` | 200 `{ user: { uuid, email, role }, merchant: { uuid, name } }` | 401 `UNAUTHORIZED` |

### Reglas que implementa tomahawk

- **`request_link`** decide el caso según el estado del usuario:
  - si no existe usuario y el comercio es apto (`dist = 1`, `clients.email`
    único y no vacío), crea el usuario `inactive` y envía el enlace de
    activación;
  - si el usuario es `active`, envía el enlace para restablecer la
    contraseña;
  - en cualquier otro caso no envía nada.

  La respuesta es la misma en todos los casos.
- **Enlace:** `https://www.dtex.cl/portal/clave/{token}`. El token es de un
  solo uso y solo se guarda su hash. La vigencia y los límites de envío los
  define tomahawk.
- **Envío del correo:** por Resend desde «DTEx® <soporte@dtex.cl>» (tomahawk v8.4.2).
- **`link`:** el portal lo llama al abrir el enlace, antes de pedir la
  contraseña, para explicar de inmediato si el enlace ya se usó, venció o no
  existe. Por eso un token usado no se borra: se marca como usado.
- **`set_password`:** marca el correo como validado y activa el usuario.
- **Contraseña:** de 10 a 72 bytes en UTF-8, guardada con bcrypt.
- **Cada request con JWT de portal** verifica que el usuario esté `active` y
  que su `email` siga siendo igual al `clients.email` normalizado (trim +
  minúsculas) del comercio. Si no se cumple, responde 401. Así se revoca el
  acceso cuando el distribuidor cambia el correo de empresa.
- **JWT:** propio del portal, distinto del de distribuidor. Lleva `user_uuid`
  y `client_uuid`.
- **`dist_cli.email` no se usa.**

## 2. Inicio

Confirmado por tomahawk (2026-11-12). Marco decidió que la App y el portal
calculen igual monto, propina y vuelto: este contrato no cambia y el reporte
de la App se alinea a él (pedido a dtex_app).

`GET /api/portal/v1/sales/summary`, con el header `x-token-dtex`. El
`client_uuid` sale del JWT.

```jsonc
{ "as_of": "2026-11-12T15:04:00-03:00",        // hora Chile, calculada en Node
  "first_sale_date": "2026-03-14" | null,
  "windows": { "current": W, "week_1": W, "week_2": W, "week_4": W, "week_8": W, "week_52": W },
  "hourly": [{ "hour": 0, "amount": 0 }, ...] }  // 24 filas, solo de current
// W = { "from", "to", "days": [Day x7, en orden, con 0 los días sin ventas] }
// Day = { "date", "amount", "count", "card_amount", "tip_amount", "cashback_amount" }
```

### Reglas

- **`amount`** es todo lo cobrado: venta + propina + cashback con tarjeta. Es
  lo que llega en el abono (decisión de Marco). Base:
  `COALESCE(monto_original, total)`, que es venta + propina, más el `vuelto`
  de las ventas con `pago_con_tarjeta = 1`.
- **`tip_amount`** es `monto_original - total`, o 0 si no hay
  `monto_original`.
- **`cashback_amount`** es el `vuelto` de las ventas con tarjeta. El vuelto en
  efectivo no se suma, porque es el cambio que se devuelve al cliente.
- **`card_amount`** es la suma de las ventas con `pago_con_tarjeta = 1`,
  cashback incluido.
- **Ventas que cuentan:** todas las filas de `dtes` del comercio, sea cual sea
  su `status`, que indica el envío al SII y no el estado de la venta.
  - Se excluyen los equipos con `es_pruebas = 1`.
  - Las notas de crédito (61) restan.
- **Corte de hoy:** el último día de cada ventana se corta en
  `LEFT(time, 4) <= HHMM` de `as_of`. Las filas sin hora cuentan en el día,
  pero no en el corte ni en `hourly`.
- Los montos van en CLP enteros. Ante un JWT inválido responde 401, igual que
  `me`.

## 3. Ventas del día

Propuesto por tomahawk y aprobado por Marco (2026-11-12), con los agregados
`payment_method`, `voided`, `by_document` y `by_card_type`. Pendiente de que
tomahawk lo implemente.

`GET /api/portal/v1/sales/day?date=YYYY-MM-DD&payment_method=cash|card&limit=200&cursor=<opaco>`,
con el header `x-token-dtex`.

```jsonc
{ "date": "2026-11-12", "as_of": "2026-11-12T15:04:00-03:00",
  "totals": { "amount", "count", "tip_amount", "cashback_amount",
    "by_payment_method": [{ "payment_method": "cash" | "card" | "...", "amount", "count",
      "tip_amount", "cashback_amount",
      "by_card_type": [{ "type": "credit" | "debit" | "prepaid" | null, "amount", "count" }] }], // solo en card
    "by_document": [{ "dte_type": 39, "dte_type_name": "Boleta", "amount", "count" }] },
  "sales": [{ "uuid": "…" | null, "time": "14:32:05" | null, "folio": 1234, "dte_type": 39,
    "dte_type_name": "Boleta", "amount", "tip_amount", "cashback_amount",
    "payment_method": "card", "voided": false,
    "card": { "brand": "Visa" | null, "type": "debit" | "credit" | "prepaid" | null, "last_four": "1234" | null } | null,
    "equipment": { "uuid", "tid" }, "subsidiary": { "uuid", "name" } | null }],
  "next_cursor": "…" | null,
  "rejections": [{ "kind": "rejected" | "cancelled", "occurred_at", "time", "amount", "payment_method": "card", "provider",
    "reason", "message", "provider_message", "card", "equipment" }] }
```

### Reglas

- Montos con las reglas del §2. Las notas de crédito (61) vienen en negativo.
- **`totals` es siempre el día completo**: no lo filtra `payment_method`. Solo
  `sales` y `next_cursor` se filtran.
- **`voided`**: una venta anulada se lista pero no suma en `totals`,
  `by_payment_method` ni `by_document`. Hoy `dtes` no tiene de dónde sacarlo:
  viene siempre `false` hasta definir la fuente (pendiente con Marco).
- **Rechazos:** no suman ni restan. `kind` separa el rechazo (banco o
  procesador) de la cancelación del cliente, que incluye el `errorCode 10` de
  TUU; tomahawk normaliza. La UI los muestra en grupos separados. Cada campo
  de `card` puede venir null por separado.
- **`message`** es el texto en español para el comercio, armado por tomahawk
  según el motivo normalizado («Fondos insuficientes», «El cliente canceló el
  pago»; si es `unknown`, «El pago no se completó»). Nunca viene null.
  `provider_message` es el texto crudo del adquirente, o null: el portal no lo
  muestra ni decide nada con él. `reason` es un código interno. Hoy `rejections` es `[]`: la App no informa
  los pagos rechazados (pedido a tomahawk y dtex_app).
- `time` viene como "HH:MM" o "HH:MM:SS", según lo que grabó el equipo.
  `sales` va ordenado por hora descendente. `limit` vale 200 por omisión, con
  un máximo de 500.
- Una fecha futura, una anterior a 2 años o una mal formada responde 400
  `INVALID_DATE`.

## 4. Abonos

Medido por tomahawk sobre los 119 abonos reales; decisiones de Marco del
2026-11-12 aplicadas. Pendiente de la aprobación final de Marco. Solo Kushki
(`liquida_mufin = 1`), datos desde el 2026-10-01. Un abono enviado es una
fila de `pagos_comercio`, que existe recién cuando se genera la nómina.

`GET /api/portal/v1/payouts?from=YYYY-MM-DD&to=YYYY-MM-DD` y
`GET /api/portal/v1/payouts/{uuid}`, con el header `x-token-dtex`.

```jsonc
// Lista: abonos con sale_date entre from y to, más recientes primero.
{ "as_of": "2026-11-12T15:04:00-03:00",
  "available": [A],          // días cerrados con ventas Kushki aún sin nómina; el día en curso no entra
  "next": P | null,          // el abono in_process más antiguo, para el Inicio
  "payouts": [P] }

// A (abono disponible): calculado sobre las ventas, todavía sin nómina
{ "sale_date": "2026-11-12", "as_of": "…",
  "gross_amount", "sales_count", "commission", "commission_tax", "adjustment",
  "amount" }                 // estimado: cambia mientras haya ventas

// P (abono enviado)
{ "uuid": "…", "sale_date": "2026-11-11",
  "gross_amount": 540000, "sales_count": 42,  // bruto Kushki del día, con propina
  "commission": 9000, "commission_tax": 1710, "adjustment": 4408,
  "amount": 533698,                           // pagado: lo que se deposita
  "status": "in_process" | "paid" | "rejected",
  "paid_on": "2026-11-12" | null,             // fecha de pago de la nómina según el banco
  "sent_on": "2026-11-12",                    // día (Chile) en que se generó la nómina
  "method": "estimated" | "reconciled", "reconciled_at": "…" | null,
  "pending_difference": 0 }

// Detalle: P + los movimientos que lo componen
{ ...P,
  "movements": [
    { "kind": "sale", "sale_uuid": "…" | null, "time": "14:32", "folio": 1234, "dte_type_name": "Boleta",
      "amount": 10000,                          // con propina, como en gross_amount
      "card": { "brand", "type", "last_four" } | null,
      "commission": 180 | null, "commission_tax": 34 | null,  // cobrado en esta venta
      "difference": 0 | null },                 // exacto − cobrado al conciliar
    { "kind": "adjustment", "origin_sale_date": "2026-11-03", "amount": 1200 } ] }  // diferencia absorbida
```

### Reglas

- **Lo que ve el comercio:**
  - `available`: «Abono disponible», en espera de pago, con el monto
    estimado. La nómina se genera automáticamente a las 00:30 de cada día y
    el pago se gestiona al día siguiente (hoy el pago es manual).
  - `in_process` y `rejected`: «Pendiente de pago». Incluye los abonos cuya
    rendición de Bci aún no se carga.
  - `paid`: «Pagado el {paid_on}».
- **Un rechazo no se muestra al comercio.** tomahawk, al procesar la
  rendición, envía un correo por Resend con el motivo y adjunta un archivo de
  nómina con solo ese registro, para volver a cargar el pago cuando el
  receptor corrija su problema.
- **El abono muestra el monto que se va a pagar**, no una cuadratura contra
  las ventas. Las diferencias se ven en el detalle de cada movimiento, porque
  apuntan a ventas o pagos concretos.
- **`available`** usa el mismo cálculo que la nómina (tomahawk lo extrae del
  job `kushki_payment` a un service compartido), para que el disponible y lo
  pagado coincidan. El día en curso no entra: el job tampoco lo paga.
- **Movimientos:** `commission`, `commission_tax` y `difference` por venta
  existen solo desde que `kushki_payment` guarde el detalle por venta (tabla
  nueva en tomahawk). En los abonos anteriores vienen null y el portal
  muestra solo la venta. La suma por venta puede diferir en $1 o $2 de la del
  abono, porque el abono redondea el total. `sale_uuid` puede venir null
  mientras no se complete el backfill de `dtes.uuid`. Cada diferencia de un
  abono anterior que se absorbe aparece como un movimiento `adjustment` con su
  `origin_sale_date`, y la suma de esos movimientos es `adjustment`.
- **`sale_date`** es el día calendario de Chile (`dtes.date`), de 00:00 a
  23:59. No se usa el corte de Kushki.
- **`gross_amount`** suma `COALESCE(monto_original, total)` de las ventas con
  `dte_payment` Kushki del día: incluye la propina; no incluye cashback, notas
  de crédito ni equipos de prueba.
- **Montos** en CLP enteros. `commission` y `commission_tax` van en positivo y
  restan; `adjustment` lleva su signo y se suma:
  `gross_amount - commission - commission_tax + adjustment = amount`.
- **`adjustment`** es la suma, con su signo, de las diferencias de abonos
  anteriores que se incluyeron en esta transferencia. La diferencia de un
  abono es exacto − pagado, y aparece cuando se concilia contra el archivo de
  Kushki con el tipo de tarjeta real.
- **`method`**: `reconciled` si ya se concilió (`metodo = exact`);
  `estimated` si no. **`pending_difference`** = `diferencia` si es ≠ 0 y
  `regularizada_en` es null; si no, 0.
- **`sent_on`** suele ser `sale_date + 1`, pero puede ser de 2 a 28 días
  después cuando hay pendientes.
- **Estado:** sale de la fila más reciente por `paid_on` en
  `bank_payout_results` con `payout_uuid = uuid`. Sin fila, `in_process`.
- **Rango:** `from ≥ 2026-10-01`, `to ≤ hoy`, a lo más 93 días. Si no, 400
  `INVALID_RANGE`.
- El `uuid` es `BIN_TO_UUID(uuid, 1)`. Uno que no es del comercio responde
  404, igual que uno que no existe.

## 5. Tarjetas por tipo, marca y banco

Pendiente de aprobación de Marco en la sesión de tomahawk. El portal ya lo
consume: mientras responda 404, el Inicio no muestra el bloque.

`GET /api/portal/v1/sales/cards?from=YYYY-MM-DD&to=YYYY-MM-DD`, con el header
`x-token-dtex`. El Inicio pide los últimos 7 días.

```jsonc
{ "from", "to",
  "by_type":   [{ "type": "credit" | "debit" | "prepaid" | null, "amount", "count" }],
  "by_brand":  [{ "brand": "Visa" | "Mastercard" | "American Express" | null, "amount", "count" }],
  "by_issuer": [{ "issuer": "BancoEstado" | … | null, "amount", "count" }], // null = adquirente sin dato de banco
  "issuer_pending": { "amount", "count" } }  // Kushki aún no informa el banco (hoy y ayer)
```

- Solo ventas con tarjeta, con las reglas de montos del §2.
- `type` sale de `dte_payment.tipo`/`tipo_de_pago` normalizado; prepago solo
  cuando lo informa el archivo de Kushki.
- `issuer` viene normalizado con el mapa de bancos (26 grafías hoy). Lo
  pendiente de Kushki va en `issuer_pending`, no en `null`.
- El portal agrupa: 5 bancos y «Otros bancos».

## 6. Detalle de una venta

Propuesto por tomahawk (2026-11-16), pendiente de aprobación de Marco. El
portal ya lo consume desde el panel lateral de Ventas (`?venta=<uuid>`); si
responde 404 o falla, el panel lo explica y la tabla sigue visible.

`GET /api/portal/v1/sales/{uuid}`, con el header `x-token-dtex`. Responde 404 si
la venta es de otro comercio.

```jsonc
{ "uuid",
  "document": { "type_code", "type_name", "folio", "issued_at", "status",
    "amounts": { "net", "tax", "tax_rate", "exempt", "total", "tip", "paid", "change" },
    "receiver": null | { "rut", "name", "business_activity", "address", "commune" }, // solo facturas
    "reference": null | { "type_code", "folio", "reason" },
    "xml_available": bool,
    // Propuesto por el portal (2026-11-17), pendiente: null si el documento no es electrónico.
    "sii": null | { "status": "pending" | "accepted" | "accepted_with_remarks" | "rejected" | "duplicate" | "unknown",
      "track_id": "0240123456" | null, "sent_at": "<ISO>" | null, "message": "<glosa del SII>" | null } },
  "items": [{ "line", "code", "description", "quantity", "unit", "unit_price", "discount_pct", "exempt", "total" }],
  "payment": null | { "method", "acquirer",
    "card": { "type", "brand", "last4", "issuer", "foreign" },
    "authorization_code", "installments", "transaction_id", "paid_at",
    "settlement": { "status": "pending" | "settled", "settled_on" } },
  "equipment": { "uuid", "tid" }, "cashier_code" }
```

- `sii` lo pidió Marco: el comercio necesita ver si el SII aceptó el documento y
  su track ID para validarlo o hacerle seguimiento. Mientras no llegue, el panel
  no muestra ese bloque. Aprobado por Marco el 2026-11-18 con los estados del
  mapeo SII que ya existe en tomahawk; `sent_at` en ISO con zona; `sii: null`
  para el ticket (td 0), que no va al SII.
- `items` viene vacío en las boletas por monto (hoy, 69 % de los documentos).
- No salen al portal: BIN, costo del adquirente, monto abonado por venta,
  identificadores internos del procesador, ubicación ni el correo del receptor.
- XML del documento: `GET /api/portal/v1/sales/{uuid}/xml`, con el header
  `x-token-dtex`. Pedido por Marco (2026-11-21), publicado por tomahawk en dev
  (v8.13.0): lo lee de Spaces y responde el XML tal cual (`application/xml`,
  `Content-Disposition: attachment; filename="<type_code>-<folio>.xml"`); los
  errores van en el sobre JSON (404 `NOT_FOUND`, 401). Hoy solo hay XML
  individual para boletas 39 y 41: las facturas guardan solo el PDF y el ticket
  no tiene XML, así que `xml_available` es true solo en esos casos. El portal lo descarga en
  `/portal/ventas/{uuid}/xml` haciendo de proxy con la sesión: al navegador no
  llega una URL firmada de Spaces. El botón aparece solo con `xml_available`.

## 7. Ventas del mes

Pedido por el portal (2026-11-20), aprobado por Marco y publicado por tomahawk
en dev el 2026-11-21 (v8.13.0), sin cambios de campos. El portal lo consume en
`/portal/ventas?mes=YYYY-MM`; mientras un tomahawk sin §7 responda 404, la vista
avisa que estará disponible pronto. Los comercios pidieron ver las ventas por mes además de por día. La
vista sigue la línea de Abonos: tira de meses, resumen del mes y una tabla
con una fila por día; cada día abre su vista diaria (§3).

`GET /api/portal/v1/sales/month?month=YYYY-MM`, con el header `x-token-dtex`.

```jsonc
{ "month": "2026-11", "as_of": "2026-11-20T15:04:00-03:00",
  "totals": { "amount", "count", "tip_amount", "cashback_amount",
    "by_payment_method": [ /* igual que §3 */ ],
    "by_document": [ /* igual que §3 */ ] },
  "days": [{ "date": "2026-11-01", "amount", "count", "tip_amount", "cashback_amount",
    "cash_amount", "cash_count", "card_amount", "card_count" }] }
```

### Reglas

- Montos, anuladas y notas de crédito con las reglas del §2 y §3: `totals`
  debe cuadrar con la suma de los `sales/day` del mes.
- `days` trae todos los días del mes hasta hoy, en orden, con 0 los días sin
  ventas (como `windows` del §2). El mes en curso se corta en `as_of`.
- `cash_*` y `card_*` siguen el `payment_method` de cada venta; si aparece otro
  medio, cuenta solo en `amount` y `count`.
- Un mes futuro, anterior a 2 años o mal formado responde 400 `INVALID_DATE`.
  Se comparan meses de calendario, con el límite inclusivo: con `as_of`
  2026-11-20 se aceptan de `2024-11` a `2026-11`, y `2024-10` responde 400.
- Sin listado de ventas: el detalle de cada venta sigue en el día (§3), así el
  mes no necesita cursor ni paginar en el servidor.

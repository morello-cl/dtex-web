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
- **Envío del correo:** por Resend desde `no-reply@mail.dtex.cl`.
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
      "by_card_type": [{ "type": "credit" | "debit" | null, "amount", "count" }] }], // solo en card
    "by_document": [{ "dte_type": 39, "dte_type_name": "Boleta", "amount", "count" }] },
  "sales": [{ "uuid": "…" | null, "time": "14:32:05" | null, "folio": 1234, "dte_type": 39,
    "dte_type_name": "Boleta", "amount", "tip_amount", "cashback_amount",
    "payment_method": "card", "voided": false,
    "card": { "brand": "Visa" | null, "type": "debit" | "credit" | null, "last_four": "1234" | null } | null,
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
  "available": A | null,     // ventas Kushki aún sin nómina (hoy, o ayer antes de las 00:30)
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

// Detalle: P + los movimientos (ventas Kushki) que lo componen
{ ...P,
  "movements": [{ "sale_uuid": "…", "time": "14:32", "folio": 1234, "dte_type_name": "Boleta",
    "amount": 10000,                          // con propina, como en gross_amount
    "card": { "brand", "type", "last_four" } | null,
    "commission": 180, "commission_tax": 34,  // de este movimiento
    "difference": 0 }] }                      // exacto − cobrado al conciliar; 0 si no hay
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

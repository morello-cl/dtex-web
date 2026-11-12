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

Confirmado por tomahawk (2026-11-12). La fórmula de cashback queda pendiente
de confirmar con App2App.

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

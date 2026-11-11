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

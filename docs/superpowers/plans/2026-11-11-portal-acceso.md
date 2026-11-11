# Portal de comercios: Acceso (proyecto 1). Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que un comercio de MUFIN active su cuenta con el correo de
empresa, defina su contraseña, ingrese al portal y recupere su contraseña.

**Architecture:** Tomahawk (sesión tomahawk_8) implementa los usuarios y la
auth según un contrato acordado en `docs/portal/contratos.md`. Este repo es
solo el intermediario (BFF): Server Actions llaman a tomahawk desde el
servidor y guardan el JWT en una cookie httpOnly, de modo que el navegador
nunca lo ve. Cada página protegida valida la sesión llamando a `me`, lo que
también aplica la revocación por cambio de correo.

**Tech Stack:** Next.js 16 (App Router, Server Actions, `useActionState`),
React 19, Tailwind v4 y `node:test` (`npm test`).

**Spec:** `docs/superpowers/specs/2026-11-10-portal-comercios-design.md` (§5).

## Global Constraints

- El portal es **solo de lectura** y no edita datos del comercio.
- El login es `clients.email` normalizado (trim + minúsculas). Nunca se usa
  `dist_cli.email`.
- Fase 1: solo `dist = 1`, solo correos únicos. Sin MFA y con un único rol
  `admin`.
- El JWT de tomahawk nunca llega al JS del navegador: va en una cookie
  httpOnly, `secure` en producción y `sameSite=lax`.
- Las respuestas a pedir un enlace son neutras: nunca revelan si el correo
  existe.
- Tomahawk responde con `{ error, message, data }`, usa rutas snake_case
  versionadas y responde 404 cuando el recurso es ajeno. Lo existente no se
  modifica.
- `/portal/*` lleva `noindex` y queda fuera del sitemap.
- Paleta del portal: `#2D0D54`, `#461FB6`, `#C9BFE6`, `#F8F7FB`, `#E4DFF0`,
  `#0A7B69` y `#8A4B00`. Sin fondos oscuros y en Inter.
- Copy en español neutro: sin mayúsculas en etiquetas, sin "·" ni "→".
- No se agregan dependencias.
- **Los correos se normalizan en el front** (trim + minúsculas) antes de
  cualquier llamada. Tomahawk recibe siempre el correo en minúsculas.
- **Tomahawk caído** (fallo de red, respuesta que no es JSON o 5xx): se
  redirige a `/portal/mantencion`, que dice que el servicio volverá pronto.
  No se muestra un error en el formulario.
- Pruebas contra prod con el comercio MUFIN: no hay entorno aislado.

## Review Focus

1. **Correo con mayúsculas o espacios** (" Ventas@Mufin.CL "): debe enviarse
   normalizado a tomahawk. Lo prueba la Task 2.
2. **Enlace vencido o ya usado:** el usuario ve "Este enlace ya se usó o
   venció. Pide uno nuevo." y, en la misma pantalla, el formulario para pedir
   otro enlace. Nunca ve un error genérico. Lo prueban la Task 2 (mapeo del
   410) y la Task 4 (manual).
3. **Tomahawk caído o con respuesta que no es JSON:** se va a
   `/portal/mantencion`, sin mostrar el cuerpo crudo y sin excepción sin
   capturar. Lo prueba la Task 2 (`isServiceDown`).
4. **Sesión revocada** (cambió el correo de empresa): `me` responde 401, se
   borra la cookie y se redirige a `/portal/ingresar`. Lo prueban la Task 2
   (`getMe` devuelve `null` con 401) y la Task 4 (manual).
5. **Contraseña de más de 72 bytes en UTF-8** (bcrypt trunca): se rechaza con
   el mensaje de largo. Lo prueba la Task 2.

---

### Task 1: Contrato de auth del comercio

**Files:**
- Create: `docs/portal/contratos.md`
- Modify: `.gitignore` (agregar `/.superpowers/`)

**Interfaces:**
- Produces: los endpoints, cuerpos y códigos que consume la Task 2.

- [ ] **Step 1: Escribir `docs/portal/contratos.md`, sección "1. Acceso", con exactamente este contrato**

Base: `TOMAHAWK_BASE_URL` (default `https://api.dtex.app`). El portal envía
`email` siempre en minúsculas y sin espacios. Todas las
respuestas usan el sobre `{ error, message, data }`; ante un error,
`message` lleva el código.

| Método y ruta | Body | Éxito | Errores |
|---|---|---|---|
| `POST /api/portal/auth/v1/request_link` | `{ email }` | 200 `{ sent: true }`, **siempre**, exista o no el correo | 429 `RATE_LIMITED` `{ retry_after_seconds }` |
| `POST /api/portal/auth/v1/set_password` | `{ token, password }` | 200 `{ token: <jwt> }` (deja la sesión iniciada) | 410 `TOKEN_INVALID` (vencido, usado o inexistente), 400 `WEAK_PASSWORD` |
| `POST /api/portal/auth/v1/login` | `{ email, password }` | 200 `{ token: <jwt>, expires_in: <segundos> }` | 401 `INVALID_CREDENTIALS` (también si el usuario está inactivo), 423 `ACCOUNT_LOCKED` `{ retry_after_seconds }` |
| `GET /api/portal/v1/me` | header `x-token-dtex` | 200 `{ user: { uuid, email, role }, merchant: { uuid, name } }` | 401 `UNAUTHORIZED` |

`set_password` también devuelve `expires_in`.

Reglas que implementa tomahawk (copiar al documento):
- **`request_link`** decide el caso según el estado del usuario:
  - si no existe usuario y el comercio es apto (`dist = 1`, `clients.email`
    único y no vacío), crea el usuario `inactive` y envía el enlace de
    activación;
  - si el usuario es `active`, envía el enlace para restablecer la
    contraseña;
  - en cualquier otro caso no envía nada.
  La respuesta es la misma en todos los casos.
- **Enlace:** `https://www.dtex.cl/portal/clave/{token}`. El token es de un
  solo uso y solo se guarda su hash. La vigencia y los límites los define
  tomahawk.
- **Correo:** se envía por Resend desde `no-reply@mail.dtex.cl`.
- **`set_password`:** marca el correo como validado y activa el usuario.
- **Contraseña:** de 10 a 72 bytes en UTF-8, guardada con bcrypt.
- **Cada request con JWT de portal** verifica que el usuario esté `active` y
  que su `email` siga siendo igual al `clients.email` normalizado del
  comercio. Si no se cumple, responde 401.
- **JWT:** propio del portal, distinto del de distribuidor. Lleva
  `user_uuid` y `client_uuid`.

- [ ] **Step 2: Agregar `/.superpowers/` a `.gitignore`**

- [ ] **Step 3: Commit**

```bash
git add docs/portal/contratos.md .gitignore
git commit -m "docs(portal): contrato de acceso con tomahawk"
```

- [ ] **Step 4: Enviar el contrato a tomahawk_8 por SendMessage**

Pegar el contenido de la sección 1 y pedirle que lo implemente en su repo
(con su aprobación de Marco allá) y que avise cuando esté en `dev.dtex.cl`.
Las tasks 2 a 4 no esperan esa respuesta: se prueban con `fetch` simulado.

---

### Task 2: Cliente de tomahawk para el portal

**Files:**
- Create: `src/lib/portal/auth.ts` (sin imports de `next/*`, para poder
  probarlo con `node --test`)
- Test: `src/lib/portal/auth.test.ts`
- Modify: `package.json` (el script `test` pasa a
  `node --test src/lib/*.test.ts src/lib/portal/*.test.ts`)

**Interfaces:**
- Consumes: el contrato de la Task 1.
- Produces:
  - `normalizeEmail(raw: string): string`
  - `passwordError(pw: string): string | null`: devuelve `null` si es válida.
  - `class PortalApiError extends Error { code: string; status: number; retryAfterSeconds?: number }`
  - `type Session = { token: string; expiresIn: number }`
  - `type Me = { user: { uuid: string; email: string; role: "admin" }; merchant: { uuid: string; name: string } }`
  - `login(email: string, password: string): Promise<Session>`
  - `requestLink(email: string): Promise<void>`
  - `setPassword(token: string, password: string): Promise<Session>`
  - `getMe(jwt: string): Promise<Me | null>`: devuelve `null` con 401 y lanza
    `PortalApiError` en los demás errores.
  - `isServiceDown(e: unknown): boolean`: es `true` si `status` es 0 (fetch
    lanzó), si la respuesta no es JSON (código `NETWORK`) o si `status >= 500`.
  - `errorMessage(e: unknown): string`: copy de los errores esperados (4xx).

- [ ] **Step 1: Escribir los tests que fallan**

Simular `fetch` con `t.mock.method(globalThis, "fetch", ...)`, que devuelve
un `new Response(JSON.stringify(body), { status })`. Seguir el estilo de
`src/lib/pay-services-return.test.ts`.

```ts
test("normaliza el correo antes de enviarlo", async (t) => {
  const f = t.mock.method(globalThis, "fetch", async () => ok({ sent: true }));
  await requestLink("  Ventas@Mufin.CL ");
  assert.deepEqual(JSON.parse(f.mock.calls[0].arguments[1].body), { email: "ventas@mufin.cl" });
});
test("passwordError: largo en bytes", () => {
  assert.equal(passwordError("123456789"), "La contraseña debe tener entre 10 y 72 caracteres.");
  assert.equal(passwordError("1234567890"), null);
  assert.equal(passwordError("ñ".repeat(37)), "La contraseña debe tener entre 10 y 72 caracteres."); // 74 bytes
});
test("login 401 → mensaje de credenciales", ...)
  // errorMessage(err) === "Correo o contraseña incorrectos."
test("login 423 → minutos de espera redondeados hacia arriba", ...)
  // data { retry_after_seconds: 61 } → "Demasiados intentos. Vuelve a intentar en 2 minutos."
test("set_password 410 → enlace vencido", ...)
  // "Este enlace ya se usó o venció. Pide uno nuevo."
test("request_link 429", ...)
  // "Ya te enviamos un enlace hace poco. Espera unos minutos antes de pedir otro."
test("fetch que lanza, respuesta no JSON o 503 → isServiceDown", ...)
  // true en los tres casos; false con 401, 410 y 429
test("getMe devuelve null con 401 y envía x-token-dtex", ...)
test("login devuelve { token, expiresIn } desde { token, expires_in }", ...)
```

- [ ] **Step 2: Correr `npm test` y verificar que falla**

Esperado: FAIL, porque no se encuentra `./auth.ts`.

- [ ] **Step 3: Implementar `src/lib/portal/auth.ts`**

- Usar un `request<T>` interno con el mismo patrón que
  `src/lib/pay-services.ts:54-82`: `cache: "no-store"`, parsear el sobre y,
  si algo falla, lanzar `PortalApiError(code = body?.message ?? "NETWORK", status)`.
  Si `fetch` lanza, se usa `status 0`.
- `passwordError` mide `new TextEncoder().encode(pw).length` entre 10 y 72.
- `errorMessage` mapea por `code`. Un código 4xx desconocido devuelve "No
  pudimos completar la operación. Intenta de nuevo."

- [ ] **Step 4: Correr `npm test` y verificar que pasa**

Esperado: todos los tests pasan, incluidos los existentes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/portal/auth.ts src/lib/portal/auth.test.ts package.json
git commit -m "feat(portal): cliente de auth contra tomahawk"
```

---

### Task 3: Sesión y Server Actions

**Files:**
- Create: `src/lib/portal/session.ts`
- Create: `src/lib/portal/actions.ts` (`"use server"`)

**Interfaces:**
- Consumes: todo lo de la Task 2.
- Produces:
  - `SESSION_COOKIE = "dtex_portal"`
  - `setSessionCookie(s: Session): Promise<void>`: httpOnly, `secure` si
    `NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/portal"` y
    `maxAge: s.expiresIn`.
  - `clearSessionCookie(): Promise<void>`
  - `requireMe(): Promise<Me>`: lee la cookie y llama a `getMe`. Si no hay
    cookie o la respuesta es `null`, borra la cookie y hace
    `redirect("/portal/ingresar")`.
  - `type FormState = { status: "idle" } | { status: "sent" } | { status: "error"; message: string; email?: string }`
  - `loginAction(prev: FormState, fd: FormData): Promise<FormState>`: si sale
    bien, hace `redirect("/portal")`.
  - `requestLinkAction(prev, fd)`: aplica el honeypot `website` (igual que en
    `src/lib/contact.ts`) y devuelve `{ status: "sent" }` si sale bien.
  - `setPasswordAction(prev, fd)`: recibe los campos `token`, `password` y
    `confirm`. Valida `passwordError` y que `password === confirm` ("Las
    contraseñas no coinciden.") antes de llamar a tomahawk. Si sale bien,
    guarda la cookie y hace `redirect("/portal")`.
  - `logoutAction(): Promise<void>`: borra la cookie y hace
    `redirect("/portal/ingresar")`.

Todas las actions y `requireMe` hacen `redirect("/portal/mantencion")` cuando
`isServiceDown(e)`.

Nota para quien implemente: `redirect()` lanza internamente, así que debe
llamarse **fuera** del `try/catch` que captura `PortalApiError`.

- [ ] **Step 1: Implementar los dos archivos**

- [ ] **Step 2: Verificar los tipos con `npx tsc --noEmit`**

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/portal/session.ts src/lib/portal/actions.ts
git commit -m "feat(portal): sesión en cookie httpOnly y server actions de acceso"
```

---

### Task 4: Pantallas de acceso

**Files:**
- Modify: `src/app/globals.css`: agregar los tokens `--mufin-900: #2d0d54`,
  `--mufin-700: #461fb6`, `--mufin-300: #c9bfe6`, `--mufin-bg: #f8f7fb`,
  `--mufin-border: #e4dff0` y mapearlos en `@theme inline` como
  `--color-mufin-*`. Para alzas y bajas se reutilizan `--accent-500` y
  `--warn-700`.
- Modify: `src/app/robots.ts`: `disallow: "/portal"`.
- Create: `src/app/portal/layout.tsx`: `metadata.robots = { index: false, follow: false }`,
  fondo `bg-mufin-bg` y una barra superior blanca con `<Logo>` (de
  `src/components/Logo.tsx`).
- Create: `src/app/portal/page.tsx`: llama a `requireMe()` y muestra "Hola,
  {merchant.name}" y el botón "Cerrar sesión" (un form con `logoutAction`).
  Es provisorio hasta el proyecto 2.
- Create: `src/app/portal/ingresar/page.tsx`
- Create: `src/app/portal/enlace/page.tsx`
- Create: `src/app/portal/clave/[token]/page.tsx`: `params` es una `Promise`
  y hay que hacerle `await`. Lleva `metadata.referrer = "no-referrer"` para
  que el token no se filtre por el header Referer.
- Create: `src/app/portal/mantencion/page.tsx`: página pública sin
  formularios, con el título "Volvemos en unos minutos", el texto "Estamos
  teniendo un problema para conectar con nuestros servidores. Tus ventas y
  abonos no se ven afectados." y el enlace "Reintentar", que lleva a
  `/portal`.
- Create: `src/components/portal/AuthForms.tsx` (`"use client"`):
  `LoginForm`, `LinkForm` y `PasswordForm({ token })`, con `useActionState`
  como en `src/components/ContactForm.tsx`.

**Interfaces:**
- Consumes: las actions y `requireMe` de la Task 3.

Copy exacto:

| Pantalla | Título | Campos y botón | Enlaces |
|---|---|---|---|
| `/portal/ingresar` | "Ingresa a tu portal DTEx®" | Correo, Contraseña, botón "Ingresar" | "¿Primera vez o no recuerdas tu contraseña?" lleva a `/portal/enlace` |
| `/portal/enlace` | "Te enviamos un enlace para definir tu contraseña" | Correo de tu empresa, botón "Enviar enlace". Al enviar, el estado `sent` reemplaza el form con: "Si el correo corresponde a un comercio habilitado, te enviamos un enlace. Revisa tu bandeja de entrada y la carpeta de spam." | "Volver a ingresar" |
| `/portal/clave/[token]` | "Define tu contraseña" | Contraseña, Repite la contraseña, botón "Guardar contraseña". Ayuda bajo el campo: "Entre 10 y 72 caracteres." | Ante el error 410, el form se reemplaza por el mensaje y un `LinkForm` en la misma pantalla para pedir otro enlace |

Los inputs de correo llevan `type="email"`, `autoCapitalize="none"` y
`spellCheck={false}`. La normalización real ocurre en la action.

Requisitos de accesibilidad:
- cada input con su `<label>`;
- `autocomplete`: `email`, `current-password` y `new-password` según el campo;
- errores en un `role="alert"`;
- foco visible en morado `#461FB6`;
- el botón se deshabilita mientras `pending`.

- [ ] **Step 1: Implementar los tokens, `robots.ts`, el layout, las tres pantallas, `AuthForms` y la página provisoria**

- [ ] **Step 2: Correr `npm run lint && npm run build && npm test`**

Esperado: sin errores. En la salida del build aparecen las rutas `/portal`,
`/portal/ingresar`, `/portal/enlace` y `/portal/clave/[token]`.

- [ ] **Step 3: Verificación manual con `npm run dev`**

- `/portal` sin cookie redirige a `/portal/ingresar`.
- En `/portal/enlace`, cualquier correo muestra el mensaje neutro. Con
  `TOMAHAWK_BASE_URL=http://localhost:9` (puerto cerrado), ingresar o pedir
  un enlace lleva a `/portal/mantencion`, y `/portal` también.
- En `/portal/clave/abc`, poner una contraseña de 9 caracteres muestra el
  error de largo sin llamar a tomahawk. Repetir con una confirmación distinta.
- `/portal/ingresar` responde 200 con `noindex` en el `<head>`, y
  `/robots.txt` incluye `Disallow: /portal`.
- Revisar el diseño a 375 px de ancho.

Cuando tomahawk_8 avise que el contrato está en `dev.dtex.cl`, apuntar
`TOMAHAWK_BASE_URL=https://dev.dtex.cl` y hacer el flujo completo con el
correo del comercio MUFIN: activar, abrir el enlace, definir la contraseña,
entrar a `/portal`, cerrar sesión e ingresar de nuevo. Después, abrir el mismo
enlace por segunda vez: debe mostrar el mensaje de enlace vencido.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/robots.ts src/app/portal src/components/portal
git commit -m "feat(portal): pantallas de ingreso, enlace y definición de contraseña"
```

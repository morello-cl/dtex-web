@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page comercial para **DTEx®** (MUFIN SpA), una plataforma fintech chilena que convierte comercios en puntos de pagos y servicios. El brief completo del cliente (mensajes, secciones, tono, qué evitar) está en `docs/web.md` — léelo antes de cambiar copy, estructura, o estilo visual. La página está en español (`<html lang="es">`).

No hay backend ni base de datos. Todos los CTAs son links `wa.me/<number>?text=<msg>` con mensaje precargado por intención.

## Stack y comandos

- **Next.js 16** (App Router, Turbopack default) + **React 19** + **TypeScript** + **Tailwind v4**
- Ver `AGENTS.md`: APIs y convenciones de Next 16 difieren de versiones anteriores; consultar `node_modules/next/dist/docs/` cuando se duden.

```bash
npm run dev      # dev server con Turbopack en :3000
npm run build    # build de producción (corre tsc + genera estático)
npm run lint     # eslint (config: eslint-config-next)
```

## Arquitectura

### Composición de la página
`src/app/page.tsx` orquesta `Navbar` + 8 secciones + `Footer`. Cada sección es autónoma y se autoenvuelve en `<Reveal>` para fade-in al scroll.

**El orden responde a prioridad comercial, no a cronología** — respetarlo al
agregar secciones:

1. `Hero`
2. `Beneficios` — 6 tarjetas, no más. Pares como boleta+factura o
   cuentas+recargas van fusionados: el brief pide "minimalista, mucho espacio
   visual", y una grilla de 9 ítems del mismo peso no jerarquiza nada.
3. `Equipos` — lo que se vende hoy, va antes que todo lo demás.
4. `Sencillito`
5. `Casos` + `Clientes` — prueba social. Van pegados y sin separador entre
   ellos (Casos no lleva `pb`, Clientes no lleva `border`): el visitante los
   percibe como un bloque, no como dos secciones.
6. `Redes` — bloque al final: las redes están en certificación y no pueden
   pesar más que lo vendible. Si se aprueban, sube de posición.
7. `CtaFinal`

Presupuesto de scroll: la home debe mantenerse cerca de las ~9 pantallas.
Llegó a 11.4 por acumulación de secciones nuevas y hubo que recortarla.

### Tailwind v4 — toda la config está en CSS
**No hay `tailwind.config.{js,ts}`.** Todo se configura en `src/app/globals.css` mediante `@import "tailwindcss"` y un bloque `@theme inline { ... }`. Las clases como `bg-brand-700`, `text-accent-500`, `bg-brand-gradient` se generan automáticamente desde tokens CSS.

**Single source of truth de la paleta**: variables `:root` en `globals.css`:
- `--brand-50..900` — azules del wordmark del logo (oscuro `#03132e` → claro `#eaf2ff`)
- `--accent-400/500/600` — turquesa/verde (CTA secundario, acentos)

Cambiar un solo valor aquí repinta toda la página. Si introduces un nuevo color, agrégalo como variable + mapéalo en `@theme inline` con `--color-<nombre>`.

Gradientes compuestos (radial + linear) viven como utilities CSS custom: `.bg-brand-gradient`, `.text-brand-gradient`, `.bg-dotgrid`. Si añades secciones que necesitan fondos suaves, prefiérelas a inlinear gradientes en JSX.

### Datos de contacto centralizados
`src/lib/site.ts` exporta `site` (nombre, WhatsApp, emails, redes) y el helper `whatsappLink('info' | 'quote' | 'sencillito')`. **Todos** los CTAs deben usar este helper — nunca hardcodear `wa.me/...` en componentes. Para añadir un nuevo intent, agrégalo al map `WA_MESSAGES` y al union type `WaIntent`.

### Animaciones
`src/components/Reveal.tsx` — componente client que aplica clase `is-visible` cuando el elemento entra en viewport (IntersectionObserver, threshold 0.12). La transición está definida en `globals.css` (`.reveal` / `.is-visible`) y respeta `prefers-reduced-motion`. **No usamos Framer Motion** — mantenerlo así salvo decisión explícita.

### Mockups visuales
Los "mockups" de POS, tickets, equipos y pantalla de pago de Sencillito son SVG inline (`PosDevice.tsx`, `DeviceIllustration` en `Equipos.tsx`, `PaymentScreen` en `Sencillito.tsx`). Decisión deliberada del cliente: no usar fotos stock. Cuando ajustes colores en estos SVGs, mantén los stops del gradiente alineados con los tokens `--brand-*` / `--accent-*`.

### Logo
- **Fuente oficial 2026**: brand pack `dtex_logo_icono` entregado por el cliente.
- `public/dtex-wordmark.webp`: derivado transparente de `DTEX-A.png`; lo usa `Logo.tsx` en navbar, footer y pagos.
- `public/dtex-icon.png`: derivado 512×512 de `DTEX-APP1.png`; lo usan los datos estructurados.
- `src/app/icon.png`: mismo ícono para la convención de favicon de Next.js.
- `src/app/opengraph-image.jpg`: imagen social regenerada con el wordmark nuevo.
- `public/dtex-logo.jpg`: copia compatible en JPEG del nuevo ícono para consumidores legacy.

No reconstruir ni modificar las formas o gradientes del logo. Para una nueva
resolución, derivar siempre desde los PNG oficiales del brand pack.

## Redes de pago (sección "en certificación")

`src/components/sections/Redes.tsx` — un solo bloque con las redes con las que
DTEx® se está certificando. **Una red = una entrada en `REDES`**, no una sección
nueva: separarlas hacía que lo no-disponible pesara más que lo vendible.

Hoy: Compraquí de BancoEstado (Súper Compraquí), Mercado Pago (Point Smart),
VirtualPos (Nexgo N86 Pro) y Kushki (Sunmi P3 — el mismo que ya se arrienda en
`Equipos`), las cuatro en certificación.

- Nombres oficiales: **Compraquí** (una palabra, con tilde; `compraqui.cl`),
  **Mercado Pago** (dos palabras), **VirtualPos**, **Kushki**.
- Copy siempre en futuro y **sin fechas** hasta que cada certificación esté
  aprobada. Al aprobarse una, agregar un campo de estado a `Red` y pasar su
  copy a presente.
- **El disclaimer al pie es obligatorio**: identifica a los dueños de cada
  marca y dice explícitamente que el uso no implica patrocinio ni respaldo.
- Logos en `public/`: `compraqui-logo.png`, `mercadopago-logo.png`,
  `virtualpos-logo.svg`, `kushki-logo.png`. Tomados de los sitios oficiales,
  **no son material licenciado**; si alguna entrega su kit de marca, reemplazar
  el archivo. El campo `alto` de cada red ajusta la altura óptica: tienen
  proporciones distintas y a la misma altura en px no se ven iguales.
- **Solo logos, sin fotos de los terminales.** Se probó con las fotos públicas
  de cada proveedor y no funciona: vienen de cuatro fuentes con distinto fondo,
  ángulo y escala, y juntas se ven como un collage. Además la de Mercado Pago
  trae publicidad encima y la única del Sunmi P3 sale con una mano y menús en
  chino. Pendiente pedirle a cada proveedor sus fotos de producto; recién ahí
  agregar un campo `foto` a `Red`.
- CTA: `whatsappLink("redes")`.

## Convenciones específicas de Next 16 en este proyecto

- `src/app/icon.png` = favicon (convención de archivo). No usar `metadata.icons`.
- `themeColor` va en `export const viewport` (no en `metadata`).
- Imágenes locales se sirven con `next/image` con `width`/`height` explícitos.

## Formulario de contacto (/contacto)

- Página: `src/app/contacto/page.tsx`. Formulario en `src/components/ContactForm.tsx` (client, `useActionState`).
- Server Action: `src/lib/contact.ts` → `sendContactEmail`. Envía vía **Resend**.
- Remitente: `no-reply@mail.dtex.cl` (dominio verificado en Resend = `mail.dtex.cl`, **no** `dtex.cl`).
- Destinatario: `ventas@dtex.cl` por defecto (override con env `CONTACT_TO`).
- Anti-spam: honeypot oculto `name="website"` + validación server-side.
- Variables de entorno:
  - `RESEND_API_KEY` — **obligatoria**, sin ella el form responde con error visible.
  - `CONTACT_TO` — opcional, override del destinatario (default `ventas@dtex.cl`).
  - `CONTACT_FROM` — opcional, override del remitente (default `DTEx® Web <no-reply@mail.dtex.cl>`). Debe estar en un dominio verificado en Resend.

## Pendientes conocidos (datos provisionales en `src/lib/site.ts`)
- URLs de redes sociales (`social.instagram`, `linkedin`, `facebook`) son placeholders.
- Faltan fotos de producto de los terminales de las redes en certificación
  (Súper Compraquí, Point Smart, Nexgo N86 Pro, Sunmi P3). Hay que pedírselas a
  cada proveedor: las públicas no sirven (ver sección Redes de pago).
- Logos reales de comercios/distribuidores en la sección Clientes (`Clientes.tsx`) están como nombres-placeholder + LogoMark SVG genérico.
- El brand pack incluye `DTEX-APP1.svg` (ícono vectorial real). `DTEX-A.svg` (wordmark) es raster embebido, por eso el wordmark del sitio es WebP.

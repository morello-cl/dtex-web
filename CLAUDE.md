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
`src/app/page.tsx` orquesta `Navbar` + 7 secciones (`Hero`, `Beneficios`, `Sencillito`, `Equipos`, `Casos`, `Clientes`, `CtaFinal`) + `Footer`. Cada sección es autónoma y se autoenvuelve en `<Reveal>` para fade-in al scroll.

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
- **Original**: `public/dtex-logo.jpg` (1254×1254, ícono de app con squircle, entregado por el cliente).
- **Derivados** (generados con ImageMagick localmente, commiteados):
  - `public/dtex-wordmark.png` (1185×680, fondo transparente, sin la onda inferior) — **el que usa `Logo.tsx`** en navbar y footer.
  - `public/dtex-icon.png` (512×512, con squircle blanco) — app icon.
  - `src/app/icon.png` — copia del anterior; Next 16 detecta este archivo por convención y lo usa como favicon. **No declarar `icons` en `metadata`** o pisa la convención.

Si necesitas regenerar el wordmark desde el JPEG:
```bash
cd public
magick dtex-logo.jpg -crop 1254x680+0+250 +repage -fuzz 10% -transparent white -trim +repage dtex-wordmark.png
```

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
- Logos reales de comercios/distribuidores en la sección Clientes (`Clientes.tsx`) están como nombres-placeholder + LogoMark SVG genérico.
- No hay versión SVG vectorial oficial del logo (solo PNG derivado del JPEG).

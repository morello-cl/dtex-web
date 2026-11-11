"use client";

import { useActionState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { whatsappLink } from "@/lib/site";
import {
  loginAction,
  requestLinkAction,
  setPasswordAction,
  type FormState,
} from "@/lib/portal/actions";
import { LINK_PROBLEMS, type LinkProblemKind } from "@/lib/portal/auth";

const idle: FormState = { status: "idle" };

// text-base en mobile (16px) evita el auto-zoom de iOS Safari al enfocar inputs.
const input =
  "w-full rounded-xl border border-mufin-border bg-white px-4 py-3 text-base text-mufin-900 focus:border-mufin-700 focus:outline-none focus:ring-2 focus:ring-mufin-300 sm:text-sm";
const label = "mb-1.5 block text-sm font-medium text-mufin-900";
const button =
  "w-full rounded-xl bg-mufin-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-mufin-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700 disabled:opacity-60";
const buttonSecondary =
  "w-full rounded-xl border border-mufin-border bg-white px-4 py-3 text-sm font-semibold text-mufin-900 transition-colors hover:border-mufin-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700 disabled:opacity-60";
const link =
  "font-medium text-mufin-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-mufin-700";

function ErrorBox({ state }: { state: FormState }) {
  if (state.status !== "error") return null;
  return (
    <p
      role="alert"
      className="rounded-xl bg-warn-50 px-4 py-3 text-sm text-warn-700"
    >
      {state.message}
    </p>
  );
}

function EmailField({
  defaultValue,
  label: text,
}: {
  defaultValue?: string;
  label: string;
}) {
  return (
    <div>
      <label htmlFor="email" className={label}>
        {text}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={defaultValue}
        className={input}
      />
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, idle);
  return (
    <form action={action} className="space-y-4">
      <ErrorBox state={state} />
      <EmailField
        label="Correo"
        defaultValue={state.status === "error" ? state.email : undefined}
      />
      <div>
        <label htmlFor="password" className={label}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </div>
      <button type="submit" disabled={pending} className={button}>
        Ingresar
      </button>
      <p className="text-center text-sm">
        <Link href="/portal/enlace" className={link}>
          ¿Primera vez o no recuerdas tu contraseña?
        </Link>
      </p>
    </form>
  );
}

export function LinkForm({ secondary = false }: { secondary?: boolean }) {
  const [state, action, pending] = useActionState(requestLinkAction, idle);
  if (state.status === "sent") {
    return (
      <p
        role="status"
        className="rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-600"
      >
        Si el correo corresponde a un comercio habilitado, te enviamos un
        enlace. Revisa tu bandeja de entrada y la carpeta de spam.
      </p>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <ErrorBox state={state} />
      <EmailField
        label="Correo de tu empresa"
        defaultValue={state.status === "error" ? state.email : undefined}
      />
      {/* Honeypot: oculto para humanos, los bots lo completan. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <button
        type="submit"
        disabled={pending}
        className={secondary ? buttonSecondary : button}
      >
        Enviar enlace
      </button>
    </form>
  );
}

export function PasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(setPasswordAction, idle);
  if (state.status === "error" && state.link) {
    // Caso raro: el enlace venció mientras escribía la contraseña.
    return <LinkProblem problem={state.link} showTitle />;
  }
  return (
    <form action={action} className="space-y-4">
      <ErrorBox state={state} />
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className={label}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-describedby="password-help"
          required
          className={input}
        />
        <p id="password-help" className="mt-1.5 text-xs text-muted">
          Entre 10 y 72 caracteres.
        </p>
      </div>
      <div>
        <label htmlFor="confirm" className={label}>
          Repite la contraseña
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={input}
        />
      </div>
      <button type="submit" disabled={pending} className={button}>
        Guardar contraseña
      </button>
    </form>
  );
}

// Barras de ejemplo de la vista previa: últimos 7 días vs semana anterior.
const PREVIEW_BARS: [number, number][] = [
  [62, 66],
  [60, 68],
  [70, 74],
  [80, 90],
  [77, 75],
  [53, 61],
  [56, 40],
];

/** Vista previa del inicio del portal: el producto como imagen de marca. */
function PortalPreview() {
  return (
    <div aria-hidden="true" className="w-full max-w-sm space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-20px_rgba(3,0,20,0.5)]">
        <p className="text-sm text-muted">Vendido en los últimos 7 días</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-mufin-900 tabular-nums">
          $4.512.900
        </p>
        <p className="mt-1 text-sm font-semibold text-accent-500">
          +9,8% vs semana anterior
        </p>
        <svg viewBox="0 0 280 96" className="mt-5 w-full">
          {PREVIEW_BARS.map(([prev, cur], i) => (
            <g key={i}>
              <rect
                x={i * 40 + 4}
                y={96 - prev}
                width="14"
                height={prev}
                rx="3"
                fill="var(--mufin-300)"
              />
              <rect
                x={i * 40 + 20}
                y={96 - cur}
                width="14"
                height={cur}
                rx="3"
                fill="var(--mufin-900)"
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="ml-10 flex items-center justify-between rounded-2xl bg-white/95 px-5 py-4 shadow-[0_20px_40px_-20px_rgba(3,0,20,0.5)]">
        <div>
          <p className="text-xs text-muted">Próximo abono</p>
          <p className="text-lg font-bold text-mufin-900 tabular-nums">
            $798.400
          </p>
        </div>
        <p className="text-right text-xs text-muted">
          Mañana
          <br />
          antes de las 10:00
        </p>
      </div>
    </div>
  );
}

export function AuthCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="portal-panel relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-tight">
          Tus ventas y tus abonos, claros y al día.
        </h2>
        <PortalPreview />
        <p className="text-sm text-white/60">
          Portal de comercios DTEx®, una plataforma de MUFIN.
        </p>
      </aside>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/portal" aria-label="Portal DTEx®" className="self-start">
          <Logo height={30} />
        </Link>
        <section className="my-auto w-full max-w-sm self-center py-12">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-mufin-900">
            {title}
          </h1>
          {children}
        </section>
        <p className="text-center text-sm text-muted">
          ¿Problemas para ingresar?{" "}
          <a
            href={whatsappLink("portal")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-mufin-700 underline-offset-4 hover:underline"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}

export function LinkProblem({
  problem,
  showTitle = false,
}: {
  problem: LinkProblemKind;
  showTitle?: boolean;
}) {
  return (
    <div className="space-y-6">
      {showTitle && (
        <h2 role="alert" className="text-lg font-semibold text-mufin-900">
          {LINK_PROBLEMS[problem].title}
        </h2>
      )}
      <p className="text-sm leading-relaxed text-muted">
        {LINK_PROBLEMS[problem].body}
      </p>
      {problem === "used" && (
        <Link
          href="/portal/ingresar"
          className="block w-full rounded-xl bg-mufin-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-mufin-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mufin-700"
        >
          Ingresar con mi contraseña
        </Link>
      )}
      <div
        className={
          problem === "used" ? "border-t border-mufin-border pt-6" : ""
        }
      >
        {problem === "used" && (
          <p className="mb-4 text-sm font-medium text-mufin-900">
            ¿Necesitas otro enlace?
          </p>
        )}
        <LinkForm secondary={problem === "used"} />
      </div>
    </div>
  );
}

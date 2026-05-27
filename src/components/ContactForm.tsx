"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  sendContactEmail,
  type ContactField,
  type ContactState,
} from "@/lib/contact";

const initialState: ContactState = { status: "idle" };

const MESSAGE_MAX = 4000;

// text-base en mobile (16px) evita el auto-zoom de iOS Safari al enfocar inputs.
const inputBase =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted/70 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 sm:text-sm";

function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-red-600">
        *
      </span>
      <span className="sr-only">(obligatorio)</span>
    </>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-xs font-medium text-red-600"
    >
      {msg}
    </p>
  );
}

const FIELD_ORDER: ContactField[] = [
  "nombre",
  "email",
  "telefono",
  "empresa",
  "ciudad",
  "mensaje",
];

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactEmail,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Mueve el foco al primer campo con error tras un submit fallido.
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    const firstErrorField = FIELD_ORDER.find((f) => state.fieldErrors?.[f]);
    if (!firstErrorField) return;
    const el = formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${firstErrorField}"]`,
    );
    el?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-accent-400/40 bg-accent-400/10 p-8 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-500 text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12l4 4 10-10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-brand-900">
          ¡Mensaje enviado!
        </h2>
        <p className="mt-2 text-sm text-muted">
          Te respondemos en horario hábil (Lun–Vie, 9:00–18:00 hrs).
        </p>
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="space-y-5"
    >
      <p className="text-xs text-muted">
        Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.
      </p>

      {state.status === "error" && !state.fieldErrors && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="nombre"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Nombre <RequiredMark />
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            aria-required="true"
            autoComplete="name"
            defaultValue={values?.nombre}
            aria-invalid={!!fieldErrors.nombre}
            aria-describedby={fieldErrors.nombre ? "nombre-error" : undefined}
            className={inputBase}
            placeholder="María Pérez"
          />
          <FieldError id="nombre-error" msg={fieldErrors.nombre} />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Email <RequiredMark />
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            defaultValue={values?.email}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={inputBase}
            placeholder="tu@empresa.cl"
          />
          <FieldError id="email-error" msg={fieldErrors.email} />
        </div>

        <div>
          <label
            htmlFor="telefono"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            defaultValue={values?.telefono}
            className={inputBase}
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div>
          <label
            htmlFor="empresa"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Empresa o negocio
          </label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            autoComplete="organization"
            defaultValue={values?.empresa}
            className={inputBase}
            placeholder="Mini-market La Esquina"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="ciudad"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Ciudad
          </label>
          <input
            id="ciudad"
            name="ciudad"
            type="text"
            autoComplete="address-level2"
            defaultValue={values?.ciudad}
            className={inputBase}
            placeholder="Villarrica"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="mensaje"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            ¿En qué te ayudamos? <RequiredMark />
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            required
            aria-required="true"
            rows={5}
            maxLength={MESSAGE_MAX}
            defaultValue={values?.mensaje}
            aria-invalid={!!fieldErrors.mensaje}
            aria-describedby={fieldErrors.mensaje ? "mensaje-error" : undefined}
            className={`${inputBase} resize-y`}
            placeholder="Cuéntanos sobre tu comercio y qué necesitas (POS, recargas, Sencillito®, etc.)"
          />
          <FieldError id="mensaje-error" msg={fieldErrors.mensaje} />
        </div>
      </div>

      {/* Honeypot anti-spam: oculto visualmente con sr-only, sigue accesible al
          DOM para que los bots lo completen. tabIndex=-1 + aria-hidden lo
          mantienen fuera del flujo para humanos y lectores de pantalla. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">No completar este campo</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? (
            <>
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeOpacity="0.25"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              Enviando…
            </>
          ) : (
            "Enviar mensaje"
          )}
        </button>
        <p className="text-xs text-muted">
          Te respondemos en horario hábil (Lun–Vie 9–18 hrs).
        </p>
      </div>

      <p className="text-xs text-muted">
        Al enviar aceptas nuestra{" "}
        <Link
          href="/privacidad"
          className="underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
        >
          Política de Privacidad
        </Link>
        .
      </p>
    </form>
  );
}

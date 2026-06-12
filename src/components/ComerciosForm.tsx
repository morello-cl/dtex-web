"use client";

import {
  useActionState,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  submitMerchantApplication,
  type ComercioField,
  type ComercioState,
} from "@/lib/comercios";

const initialState: ComercioState = { status: "idle" };

// text-base en mobile (16px) evita el auto-zoom de iOS Safari al enfocar inputs.
const inputBase =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted/70 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 sm:text-sm";

type StepKey = "empresa" | "representante";

const STEPS: Array<{
  key: StepKey;
  label: string;
  title: string;
  fields: ComercioField[];
}> = [
  {
    key: "empresa",
    label: "Empresa",
    title: "Información de la empresa",
    fields: [
      "empresa_rut",
      "empresa_razon_social",
      "empresa_nombre_fantasia",
      "empresa_telefono",
      "empresa_email",
      "empresa_direccion",
      "empresa_comuna",
    ],
  },
  {
    key: "representante",
    label: "Representante",
    title: "Representante legal",
    fields: ["rep_rut", "rep_nombre", "rep_telefono", "rep_email"],
  },
];

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

function StepIndicator({ current }: { current: number }) {
  const pct = Math.round(((current + 1) / STEPS.length) * 100);
  return (
    <nav aria-label="Progreso del formulario" className="mb-8">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Paso {current + 1} de {STEPS.length}
        </p>
        <p className="text-xs text-muted">
          {current + 1 < STEPS.length
            ? `Faltan ${STEPS.length - current - 1} ${
                STEPS.length - current - 1 === 1 ? "paso" : "pasos"
              }`
            : "Último paso"}
        </p>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-50"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso: ${pct}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="mt-4 grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => {
          const isDone = i < current;
          const isCurrent = i === current;
          return (
            <li
              key={s.key}
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center gap-2"
            >
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? "bg-brand-700 text-white"
                    : isDone
                      ? "bg-accent-500 text-white"
                      : "bg-brand-50 text-brand-700"
                }`}
                aria-hidden="true"
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12l4 4 10-10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`truncate text-xs font-medium sm:text-sm ${
                  isCurrent
                    ? "text-foreground"
                    : isDone
                      ? "text-foreground/80"
                      : "text-muted"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Field({
  name,
  label,
  required = false,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
  defaultValue,
  error,
  pattern,
  maxLength,
  fullWidth = false,
  children,
}: {
  name: ComercioField;
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  defaultValue?: string;
  error?: string;
  pattern?: string;
  maxLength?: number;
  fullWidth?: boolean;
  children?: ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-foreground"
      >
        {label} {required && <RequiredMark />}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          aria-required={required || undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          defaultValue={defaultValue}
          pattern={pattern}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={inputBase}
        />
      )}
      <FieldError id={errorId} msg={error} />
    </div>
  );
}

function SectionLabel({
  icon,
  label,
  hint,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="sm:col-span-2 mt-2 flex items-center gap-3 first:mt-0">
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-brand-900">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
function IconBuilding() {
  return (
    <IconSvg>
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M16 9h2a2 2 0 0 1 2 2v10" />
      <path d="M3 21h18" />
      <path d="M8 7h4M8 11h4M8 15h4" />
    </IconSvg>
  );
}
function IconPhone() {
  return (
    <IconSvg>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </IconSvg>
  );
}
function IconPin() {
  return (
    <IconSvg>
      <path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13Z" />
      <circle cx="12" cy="9" r="2.5" />
    </IconSvg>
  );
}

export default function ComerciosForm() {
  const [state, formAction, pending] = useActionState(
    submitMerchantApplication,
    initialState,
  );
  const [step, setStep] = useState(0);
  const [lastSeenState, setLastSeenState] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);

  // Patrón "adjusting state when a prop changes": evita useEffect + setState (cascada de renders).
  if (state !== lastSeenState) {
    setLastSeenState(state);
    if (state.status === "error" && state.fieldErrors) {
      const firstBadIdx = STEPS.findIndex((s) =>
        s.fields.some((f) => state.fieldErrors?.[f]),
      );
      if (firstBadIdx >= 0 && firstBadIdx !== step) setStep(firstBadIdx);
    }
  }

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
          ¡Solicitud enviada!
        </h2>
        <p className="mt-2 text-sm text-muted">
          Recibimos los datos de tu comercio. Te contactaremos para coordinar
          los próximos pasos (incluida la Clave SII por canal seguro) en horario
          hábil.
        </p>
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const values =
    state.status === "error" ? state.values : (undefined as undefined);

  const errorOf = (f: ComercioField) => fieldErrors[f];
  const valueOf = (f: ComercioField) => values?.[f];

  const isLast = step === STEPS.length - 1;

  // Validación nativa del paso actual antes de avanzar.
  function goNext() {
    const form = formRef.current;
    if (!form) return;
    const stepFields = STEPS[step].fields;
    let firstInvalid: HTMLInputElement | HTMLSelectElement | null = null;
    for (const name of stepFields) {
      const el = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLSelectElement
        | null;
      if (!el) continue;
      if (!el.checkValidity()) {
        firstInvalid = el;
        break;
      }
    }
    if (firstInvalid) {
      firstInvalid.reportValidity();
      firstInvalid.focus();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    // Scroll al inicio del form para que el siguiente paso quede visible.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="space-y-6"
    >
      <StepIndicator current={step} />

      <h2 className="text-lg font-bold tracking-tight">{STEPS[step].title}</h2>

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

      {/* Paso 1: Empresa */}
      <div hidden={step !== 0} className="grid gap-5 sm:grid-cols-2">
        <SectionLabel
          icon={<IconBuilding />}
          label="Identificación de la empresa"
        />
        <Field
          name="empresa_rut"
          label="RUT empresa"
          required
          placeholder="76.123.456-7"
          autoComplete="off"
          inputMode="text"
          maxLength={12}
          defaultValue={valueOf("empresa_rut")}
          error={errorOf("empresa_rut")}
        />
        <Field
          name="empresa_razon_social"
          label="Razón social"
          required
          autoComplete="organization"
          placeholder="Comercial La Esquina SpA"
          defaultValue={valueOf("empresa_razon_social")}
          error={errorOf("empresa_razon_social")}
        />
        <Field
          name="empresa_nombre_fantasia"
          label="Nombre de fantasía"
          required
          placeholder="Mini-market La Esquina"
          fullWidth
          defaultValue={valueOf("empresa_nombre_fantasia")}
          error={errorOf("empresa_nombre_fantasia")}
        />

        <SectionLabel icon={<IconPhone />} label="Contacto" />
        <Field
          name="empresa_telefono"
          label="Teléfono"
          required
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+56 9 1234 5678"
          defaultValue={valueOf("empresa_telefono")}
          error={errorOf("empresa_telefono")}
        />
        <Field
          name="empresa_email"
          label="Correo electrónico"
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="contacto@empresa.cl"
          defaultValue={valueOf("empresa_email")}
          error={errorOf("empresa_email")}
        />

        <SectionLabel icon={<IconPin />} label="Ubicación" />
        <Field
          name="empresa_comuna"
          label="Comuna"
          required
          autoComplete="address-level2"
          placeholder="Villarrica"
          defaultValue={valueOf("empresa_comuna")}
          error={errorOf("empresa_comuna")}
        />
        <Field
          name="empresa_direccion"
          label="Dirección"
          required
          autoComplete="street-address"
          placeholder="Av. Pedro de Valdivia 123"
          defaultValue={valueOf("empresa_direccion")}
          error={errorOf("empresa_direccion")}
        />
      </div>

      {/* Paso 2: Representante legal */}
      <div hidden={step !== 1} className="grid gap-5 sm:grid-cols-2">
        <Field
          name="rep_rut"
          label="RUT representante legal"
          required
          placeholder="12.345.678-9"
          autoComplete="off"
          maxLength={12}
          defaultValue={valueOf("rep_rut")}
          error={errorOf("rep_rut")}
        />
        <Field
          name="rep_nombre"
          label="Nombre completo"
          required
          autoComplete="name"
          placeholder="María Pérez González"
          defaultValue={valueOf("rep_nombre")}
          error={errorOf("rep_nombre")}
        />
        <Field
          name="rep_telefono"
          label="Teléfono"
          required
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+56 9 1234 5678"
          defaultValue={valueOf("rep_telefono")}
          error={errorOf("rep_telefono")}
        />
        <Field
          name="rep_email"
          label="Correo electrónico"
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="maria@empresa.cl"
          defaultValue={valueOf("rep_email")}
          error={errorOf("rep_email")}
        />
        <p className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          <strong>Nota de seguridad:</strong> la <strong>Clave SII</strong> y los{" "}
          <strong>datos bancarios</strong> para abonos no se piden por este
          formulario. Una vez recibida tu inscripción, los coordinamos por
          canal seguro durante el onboarding.
        </p>
      </div>

      {/* Honeypot anti-spam */}
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

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || pending}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand-200 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Atrás
        </button>

        {isLast ? (
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
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
              "Enviar solicitud"
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md"
          >
            Siguiente →
          </button>
        )}
      </div>

      <p className="text-xs text-muted">
        Al enviar aceptas nuestra{" "}
        <Link
          href="/privacidad"
          className="underline decoration-brand-200 underline-offset-2 hover:text-brand-700"
        >
          Política de Privacidad
        </Link>
        . Tus datos se usarán solo para activar tu comercio en DTEx®.
      </p>
    </form>
  );
}

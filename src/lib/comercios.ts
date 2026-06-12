"use server";

import { Resend } from "resend";
import { site } from "./site";

export type ComercioField =
  // Empresa
  | "empresa_rut"
  | "empresa_razon_social"
  | "empresa_nombre_fantasia"
  | "empresa_telefono"
  | "empresa_email"
  | "empresa_direccion"
  | "empresa_comuna"
  // Representante legal
  | "rep_rut"
  | "rep_nombre"
  | "rep_telefono"
  | "rep_email";

export type ComercioValues = Record<ComercioField, string>;

export type ComercioState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<ComercioField, string>>;
      values: ComercioValues;
    };

const FROM = process.env.CONTACT_FROM ?? "DTEx® Web <no-reply@mail.dtex.cl>";
const TO = process.env.COMERCIOS_TO ?? process.env.CONTACT_TO ?? site.email;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Valida un RUT chileno (módulo 11). Acepta con o sin puntos/guion.
function isValidRut(raw: string): boolean {
  const clean = raw.replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);
  return expected === dv;
}

// Normaliza RUT a formato 12.345.678-9 para mostrar / loguear.
function formatRut(raw: string): string {
  const clean = raw.replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return raw;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}

export async function submitMerchantApplication(
  _prev: ComercioState,
  formData: FormData,
): Promise<ComercioState> {
  if ((formData.get("website") as string | null)?.trim()) {
    return { status: "success" };
  }

  const get = (k: ComercioField) =>
    ((formData.get(k) as string | null) ?? "").trim();

  const data: ComercioValues = {
    empresa_rut: get("empresa_rut"),
    empresa_razon_social: get("empresa_razon_social"),
    empresa_nombre_fantasia: get("empresa_nombre_fantasia"),
    empresa_telefono: get("empresa_telefono"),
    empresa_email: get("empresa_email"),
    empresa_direccion: get("empresa_direccion"),
    empresa_comuna: get("empresa_comuna"),
    rep_rut: get("rep_rut"),
    rep_nombre: get("rep_nombre"),
    rep_telefono: get("rep_telefono"),
    rep_email: get("rep_email"),
  };

  const fieldErrors: Partial<Record<ComercioField, string>> = {};

  if (!isValidRut(data.empresa_rut))
    fieldErrors.empresa_rut = "RUT inválido.";
  if (data.empresa_razon_social.length < 2)
    fieldErrors.empresa_razon_social = "Ingresa la razón social.";
  if (data.empresa_nombre_fantasia.length < 2)
    fieldErrors.empresa_nombre_fantasia = "Ingresa el nombre de fantasía.";
  if (data.empresa_telefono.length < 6)
    fieldErrors.empresa_telefono = "Teléfono inválido.";
  if (!EMAIL_RE.test(data.empresa_email))
    fieldErrors.empresa_email = "Email inválido.";
  if (data.empresa_direccion.length < 3)
    fieldErrors.empresa_direccion = "Ingresa la dirección.";
  if (data.empresa_comuna.length < 2)
    fieldErrors.empresa_comuna = "Ingresa la comuna.";

  if (!isValidRut(data.rep_rut)) fieldErrors.rep_rut = "RUT inválido.";
  if (data.rep_nombre.length < 2)
    fieldErrors.rep_nombre = "Ingresa el nombre completo.";
  if (data.rep_telefono.length < 6)
    fieldErrors.rep_telefono = "Teléfono inválido.";
  if (!EMAIL_RE.test(data.rep_email))
    fieldErrors.rep_email = "Email inválido.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors,
      values: data,
    };
  }

  // Modo dev: si MOCK_EMAIL=1, no llamamos a Resend — solo logueamos y
  // devolvemos success para poder probar el flujo end-to-end sin API key.
  if (process.env.MOCK_EMAIL === "1") {
    console.log("[comercios] MOCK_EMAIL=1 — payload:");
    console.log({ to: TO, from: FROM, replyTo: data.empresa_email, data });
    return { status: "success" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "[comercios] RESEND_API_KEY no configurada. " +
        "Para probar local sin API key, exporta MOCK_EMAIL=1 antes de npm run dev.",
    );
    return {
      status: "error",
      message:
        "No pudimos enviar tu solicitud. Escríbenos directo a " +
        site.email +
        ".",
      values: data,
    };
  }

  const resend = new Resend(apiKey);

  const subject = `Inscripción de comercio — ${data.empresa_nombre_fantasia} (${formatRut(
    data.empresa_rut,
  )})`;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:5px 14px 5px 0;color:#5a6781;vertical-align:top">${escapeHtml(label)}</td><td style="vertical-align:top"><strong>${escapeHtml(value)}</strong></td></tr>`;

  const htmlBody = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#04132e;line-height:1.55;max-width:640px">
      <h2 style="margin:0 0 8px;color:#0d2e72">Nueva inscripción de comercio</h2>
      <p style="margin:0 0 20px;color:#5a6781;font-size:13px">
        Recibida desde dtex.cl/comercios
      </p>

      <h3 style="margin:24px 0 10px;color:#0d2e72;font-size:15px;border-bottom:1px solid #dfe8f5;padding-bottom:6px">Empresa</h3>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${row("RUT", formatRut(data.empresa_rut))}
        ${row("Razón social", data.empresa_razon_social)}
        ${row("Nombre de fantasía", data.empresa_nombre_fantasia)}
        ${row("Teléfono", data.empresa_telefono)}
        ${row("Email", data.empresa_email)}
        ${row("Dirección", data.empresa_direccion)}
        ${row("Comuna", data.empresa_comuna)}
      </table>

      <h3 style="margin:24px 0 10px;color:#0d2e72;font-size:15px;border-bottom:1px solid #dfe8f5;padding-bottom:6px">Representante legal</h3>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${row("RUT", formatRut(data.rep_rut))}
        ${row("Nombre", data.rep_nombre)}
        ${row("Teléfono", data.rep_telefono)}
        ${row("Email", data.rep_email)}
      </table>

      <p style="margin:28px 0 0;padding:12px 14px;background:#fff7e6;border:1px solid #f5c97a;border-radius:8px;font-size:13px;color:#7a4a00">
        <strong>Recordatorio:</strong> la Clave SII y los datos bancarios para abonos
        no se solicitan por formulario web. Coordinen su captura por canal seguro
        durante el onboarding.
      </p>
    </div>
  `;

  const textBody = [
    "INSCRIPCIÓN DE COMERCIO",
    "",
    "Empresa",
    `  RUT: ${formatRut(data.empresa_rut)}`,
    `  Razón social: ${data.empresa_razon_social}`,
    `  Nombre de fantasía: ${data.empresa_nombre_fantasia}`,
    `  Teléfono: ${data.empresa_telefono}`,
    `  Email: ${data.empresa_email}`,
    `  Dirección: ${data.empresa_direccion}`,
    `  Comuna: ${data.empresa_comuna}`,
    "",
    "Representante legal",
    `  RUT: ${formatRut(data.rep_rut)}`,
    `  Nombre: ${data.rep_nombre}`,
    `  Teléfono: ${data.rep_telefono}`,
    `  Email: ${data.rep_email}`,
    "",
    "Recordatorio: la Clave SII y los datos bancarios no se solicitan por web — coordinar por canal seguro durante onboarding.",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: data.empresa_email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error("[comercios] Resend error:", error);
      return {
        status: "error",
        message:
          "No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos a " +
          site.email +
          ".",
        values: data,
      };
    }

    return { status: "success" };
  } catch (err) {
    console.error("[comercios] excepción al enviar:", err);
    return {
      status: "error",
      message:
        "No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos a " +
        site.email +
        ".",
      values: data,
    };
  }
}

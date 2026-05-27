"use server";

import { Resend } from "resend";
import { site } from "./site";

export type ContactField =
  | "nombre"
  | "email"
  | "telefono"
  | "empresa"
  | "ciudad"
  | "mensaje";

export type ContactValues = Record<ContactField, string>;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<ContactField, string>>;
      values: ContactValues;
    };

const FROM = process.env.CONTACT_FROM ?? "DTEx® Web <no-reply@mail.dtex.cl>";
const TO = process.env.CONTACT_TO ?? site.email;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactEmail(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: bots autocompletan; humanos no ven el campo.
  if ((formData.get("website") as string | null)?.trim()) {
    return { status: "success" };
  }

  const data = {
    nombre: (formData.get("nombre") as string | null)?.trim() ?? "",
    email: (formData.get("email") as string | null)?.trim() ?? "",
    telefono: (formData.get("telefono") as string | null)?.trim() ?? "",
    empresa: (formData.get("empresa") as string | null)?.trim() ?? "",
    ciudad: (formData.get("ciudad") as string | null)?.trim() ?? "",
    mensaje: (formData.get("mensaje") as string | null)?.trim() ?? "",
  };

  const fieldErrors: Partial<Record<ContactField, string>> = {};
  if (data.nombre.length < 2) fieldErrors.nombre = "Ingresa tu nombre.";
  if (!EMAIL_RE.test(data.email)) fieldErrors.email = "Email inválido.";
  if (data.mensaje.length < 10)
    fieldErrors.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  if (data.mensaje.length > 4000) fieldErrors.mensaje = "Mensaje demasiado largo.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors,
      values: data,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY no configurada");
    return {
      status: "error",
      message:
        "No pudimos enviar tu mensaje. Escríbenos directo a " + site.email + ".",
      values: data,
    };
  }

  const resend = new Resend(apiKey);

  const subject = `Contacto web — ${data.nombre}${data.empresa ? ` (${data.empresa})` : ""}`;

  const textBody = [
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    data.telefono && `Teléfono: ${data.telefono}`,
    data.empresa && `Empresa: ${data.empresa}`,
    data.ciudad && `Ciudad: ${data.ciudad}`,
    "",
    "Mensaje:",
    data.mensaje,
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#04132e;line-height:1.55">
      <h2 style="margin:0 0 16px;color:#0d2e72">Nuevo contacto desde dtex.cl</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#5a6781">Nombre</td><td><strong>${escapeHtml(data.nombre)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#5a6781">Email</td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
        ${data.telefono ? `<tr><td style="padding:4px 12px 4px 0;color:#5a6781">Teléfono</td><td>${escapeHtml(data.telefono)}</td></tr>` : ""}
        ${data.empresa ? `<tr><td style="padding:4px 12px 4px 0;color:#5a6781">Empresa</td><td>${escapeHtml(data.empresa)}</td></tr>` : ""}
        ${data.ciudad ? `<tr><td style="padding:4px 12px 4px 0;color:#5a6781">Ciudad</td><td>${escapeHtml(data.ciudad)}</td></tr>` : ""}
      </table>
      <hr style="border:none;border-top:1px solid #dfe8f5;margin:20px 0" />
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(data.mensaje)}</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: data.email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return {
        status: "error",
        message:
          "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a " +
          site.email +
          ".",
        values: data,
      };
    }

    return { status: "success" };
  } catch (err) {
    console.error("[contact] excepción al enviar:", err);
    return {
      status: "error",
      message:
        "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a " +
        site.email +
        ".",
      values: data,
    };
  }
}

"use server";

import { redirect } from "next/navigation";
import {
  errorMessage,
  isServiceDown,
  login,
  normalizeEmail,
  passwordError,
  requestLink,
  setPassword,
  type Session,
} from "./auth";
import { clearSessionCookie, setSessionCookie } from "./session";

export type FormState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string; email?: string; expired?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(fd: FormData, name: string): string {
  return (fd.get(name) as string | null) ?? "";
}

// redirect() lanza internamente: siempre fuera de los try/catch.
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = normalizeEmail(field(fd, "email"));
  const password = field(fd, "password");
  if (!EMAIL_RE.test(email) || !password) {
    return { status: "error", message: "Ingresa tu correo y tu contraseña.", email };
  }

  let session: Session;
  try {
    session = await login(email, password);
  } catch (e) {
    if (isServiceDown(e)) redirect("/portal/mantencion");
    return { status: "error", message: errorMessage(e), email };
  }
  await setSessionCookie(session);
  redirect("/portal");
}

export async function requestLinkAction(_prev: FormState, fd: FormData): Promise<FormState> {
  // Honeypot: los bots completan el campo oculto; los humanos no lo ven.
  if (field(fd, "website").trim()) return { status: "sent" };

  const email = normalizeEmail(field(fd, "email"));
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Ingresa un correo válido.", email };
  }

  try {
    await requestLink(email);
  } catch (e) {
    if (isServiceDown(e)) redirect("/portal/mantencion");
    return { status: "error", message: errorMessage(e), email };
  }
  return { status: "sent" };
}

export async function setPasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = field(fd, "token");
  const password = field(fd, "password");
  const invalid = passwordError(password);
  if (invalid) return { status: "error", message: invalid };
  if (password !== field(fd, "confirm")) {
    return { status: "error", message: "Las contraseñas no coinciden." };
  }

  let session: Session;
  try {
    session = await setPassword(token, password);
  } catch (e) {
    if (isServiceDown(e)) redirect("/portal/mantencion");
    return {
      status: "error",
      message: errorMessage(e),
      expired: (e as { code?: string }).code === "TOKEN_INVALID",
    };
  }
  await setSessionCookie(session);
  redirect("/portal");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/portal/ingresar");
}

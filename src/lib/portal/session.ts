import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMe, isServiceDown, type Me, type Session } from "./auth";

export const SESSION_COOKIE = "dtex_portal";

export async function setSessionCookie(s: Session): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, s.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/portal",
    maxAge: s.expiresIn,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/portal" });
}

// ponytail: valida contra tomahawk en cada página protegida (1 request extra);
// así se aplica la revocación por cambio de correo sin estado propio.
export async function requireMe(): Promise<Me> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let me: Me | null = null;
  let down = false;
  if (token) {
    try {
      me = await getMe(token);
    } catch (e) {
      down = isServiceDown(e);
    }
  }
  if (down) redirect("/portal/mantencion");
  if (!me) redirect("/portal/ingresar");
  return me;
}

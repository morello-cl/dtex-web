import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { portalUrl } from "@/lib/portal/auth";
import { SESSION_COOKIE } from "@/lib/portal/session";

// Descarga del XML de un documento (tomahawk lo lee de Spaces). El portal hace
// de proxy con la sesión del comercio: al navegador no llega una URL firmada.
const text = (body: string, status: number) => new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });

export async function GET(_req: NextRequest, ctx: RouteContext<"/portal/ventas/[uuid]/xml">) {
  const { uuid } = await ctx.params;
  const jwt = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!jwt) redirect("/portal/ingresar");
  let r: Response;
  try {
    r = await fetch(portalUrl(`/api/portal/v1/sales/${encodeURIComponent(uuid)}/xml`), {
      headers: { "x-token-dtex": jwt, accept: "application/xml" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return text("No pudimos descargar el XML en este momento. Intenta más tarde.", 502);
  }
  if (r.status === 401) redirect("/portal/ingresar");
  if (r.status === 404) return text("Este documento no tiene XML disponible.", 404);
  if (!r.ok || !r.body) return text("No pudimos descargar el XML en este momento. Intenta más tarde.", 502);
  return new Response(r.body, {
    headers: {
      "content-type": "application/xml; charset=iso-8859-1",
      "content-disposition": r.headers.get("content-disposition") ?? `attachment; filename="documento-${uuid}.xml"`,
      "cache-control": "private, no-store",
    },
  });
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Vista previa al compartir el enlace del portal (WhatsApp, correo): marca MUFIN, no la de la landing DTEx®.
export const alt = "Portal de pagos MUFIN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/mufin-logo.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#ffffff" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <img src={logo} width={480} height={114} alt="" />
          <div style={{ marginTop: 48, fontSize: 64, fontWeight: 700, color: "#1E293B" }}>Portal de pagos</div>
          <div style={{ marginTop: 16, fontSize: 34, color: "#5a6781" }}>Revisa tus ventas y tus abonos.</div>
        </div>
        <div style={{ height: 24, background: "linear-gradient(90deg, #7C25C4, #4A1A7A)" }} />
      </div>
    ),
    size,
  );
}

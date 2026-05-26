import Image from "next/image";

type Props = {
  className?: string;
  /** Altura del logo en px. Por defecto 32 (navbar). */
  height?: number;
  priority?: boolean;
};

const ASPECT = 1185 / 680;

// Wordmark oficial DTEx® (WebP con fondo transparente, generado desde el
// JPEG entregado por el cliente). Ver public/dtex-wordmark.webp.
export default function Logo({
  className = "",
  height = 32,
  priority = false,
}: Props) {
  const width = Math.round(height * ASPECT);
  return (
    <Image
      src="/dtex-wordmark.webp"
      alt="DTEx — Boleta Electrónica"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}

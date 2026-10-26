import Image from "next/image";

type Props = {
  className?: string;
  /** Altura del logo en px. Por defecto 32 (navbar). */
  height?: number;
  priority?: boolean;
};

const ASPECT = 1959 / 502;

// Wordmark oficial DTEx® del brand pack 2026, optimizado a WebP transparente.
export default function Logo({
  className = "",
  height = 32,
  priority = false,
}: Props) {
  const width = Math.round(height * ASPECT);
  return (
    <Image
      src="/dtex-wordmark.webp"
      alt="DTEx® — Pagos y servicios"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}

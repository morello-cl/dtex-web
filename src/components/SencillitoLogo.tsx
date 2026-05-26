import Image from "next/image";

type Props = {
  className?: string;
  /** Altura del logo en px. Por defecto 28. */
  height?: number;
};

const ASPECT = 1140 / 222;

// Logo oficial Sencillito®. Por contrato no se puede alterar el diseño:
// solo cambiar tamaño. WebP generado con `magick sencillito.png -trim` +
// `magick … -quality 90 sencillito-logo.webp` desde el archivo entregado.
export default function SencillitoLogo({
  className = "",
  height = 28,
}: Props) {
  const width = Math.round(height * ASPECT);
  return (
    <Image
      src="/sencillito-logo.webp"
      alt="Sencillito — pago de cuentas y servicios"
      width={width}
      height={height}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}

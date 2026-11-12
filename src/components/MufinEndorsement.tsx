import Image from "next/image";

const ASPECT = 640 / 152;

// Sello de respaldo: va junto al logo DTEx® ("DTEx®, una aplicación MUFIN").
export default function MufinEndorsement({
  height = 16,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-muted ${className}`}
    >
      una aplicación
      <Image
        src="/mufin-logo.png"
        alt="MUFIN"
        width={Math.round(height * ASPECT)}
        height={height}
        style={{ height, width: "auto" }}
      />
    </span>
  );
}

import Image from "next/image";

const ASPECT = 640 / 152;

// El portal es de MUFIN; DTEx® es la app con la que el comercio cobra.
export default function MufinLogo({ height = 28 }: { height?: number }) {
  return (
    <Image
      src="/mufin-logo.png"
      alt="MUFIN"
      width={Math.round(height * ASPECT)}
      height={height}
      priority
      style={{ height, width: "auto" }}
    />
  );
}

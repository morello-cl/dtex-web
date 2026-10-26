import Image from "next/image";

const ASPECT = 640 / 152;

export default function TechnologyByMufin({ height = 20 }: { height?: number }) {
  return (
    <div className="inline-flex items-center gap-2.5" aria-label="Tecnología MUFIN">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
        Tecnología
      </span>
      <Image
        src="/mufin-logo.png"
        alt="MUFIN"
        width={Math.round(height * ASPECT)}
        height={height}
        style={{ height, width: "auto" }}
      />
    </div>
  );
}

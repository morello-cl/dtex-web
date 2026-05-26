type Props = {
  className?: string;
};

// Mockup CSS/SVG de un POS Android con impresora integrada mostrando la UI
// de DTEx. Pensado para verse "tangible" sin recurrir a fotos stock.
export default function PosDevice({ className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 360 540"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full drop-shadow-[0_30px_60px_rgba(13,46,114,0.25)]"
        role="img"
        aria-label="Equipo POS Android DTEx con ticket impreso"
      >
        <defs>
          <linearGradient id="pos-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#142446" />
            <stop offset="1" stopColor="#07112a" />
          </linearGradient>
          <linearGradient id="pos-screen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0d2e72" />
            <stop offset="1" stopColor="#1f55bd" />
          </linearGradient>
          <linearGradient id="ticket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#eaf2ff" />
          </linearGradient>
        </defs>

        {/* Cuerpo del POS */}
        <rect
          x="40"
          y="20"
          width="280"
          height="380"
          rx="28"
          fill="url(#pos-body)"
        />
        {/* Borde interior */}
        <rect
          x="48"
          y="28"
          width="264"
          height="364"
          rx="22"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
        {/* Cámara */}
        <circle cx="180" cy="44" r="3" fill="#1d2c4d" />

        {/* Pantalla */}
        <rect x="62" y="60" width="236" height="300" rx="14" fill="url(#pos-screen)" />

        {/* UI app DTEx */}
        {/* status bar */}
        <text
          x="74"
          y="80"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="600"
          opacity="0.85"
        >
          9:41
        </text>
        <rect x="270" y="72" width="18" height="8" rx="2" fill="white" opacity="0.6" />
        <rect x="252" y="72" width="12" height="8" rx="2" fill="white" opacity="0.6" />

        {/* logo DTEx */}
        <text
          x="74"
          y="106"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontSize="11"
          opacity="0.7"
        >
          DTEx®
        </text>

        {/* monto */}
        <text
          x="74"
          y="142"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontSize="14"
          opacity="0.75"
        >
          Total a cobrar
        </text>
        <text
          x="74"
          y="178"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontSize="32"
          fontWeight="800"
        >
          $14.990
        </text>

        {/* chip card */}
        <rect x="74" y="200" width="212" height="80" rx="12" fill="rgba(255,255,255,0.08)" />
        <rect x="86" y="216" width="28" height="20" rx="4" fill="#21c1a6" />
        <text
          x="86"
          y="262"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontSize="11"
          opacity="0.85"
          letterSpacing="3"
        >
          •••• •••• •••• 4242
        </text>

        {/* botón */}
        <rect x="74" y="296" width="212" height="44" rx="22" fill="#21c1a6" />
        <text
          x="180"
          y="324"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
        >
          Cobrar con tarjeta
        </text>

        {/* Impresora térmica */}
        <rect x="56" y="400" width="248" height="40" rx="10" fill="#07112a" />
        <rect x="76" y="412" width="208" height="6" rx="3" fill="#142446" />
        <rect x="76" y="422" width="120" height="4" rx="2" fill="#142446" />

        {/* Ticket saliendo */}
        <path
          d="M70 440 Q70 430 80 430 L280 430 Q290 430 290 440 L290 520 Q290 528 282 528 L78 528 Q70 528 70 520 Z"
          fill="url(#ticket)"
          stroke="rgba(7,32,79,0.08)"
          strokeWidth="1"
        />
        {/* dientes del ticket */}
        <path
          d="M70 530 L80 524 L90 530 L100 524 L110 530 L120 524 L130 530 L140 524 L150 530 L160 524 L170 530 L180 524 L190 530 L200 524 L210 530 L220 524 L230 530 L240 524 L250 530 L260 524 L270 530 L280 524 L290 530 L290 540 L70 540 Z"
          fill="white"
        />

        {/* Contenido del ticket */}
        <text
          x="180"
          y="452"
          fill="#0d2e72"
          fontFamily="Inter, sans-serif"
          fontSize="9"
          fontWeight="700"
          textAnchor="middle"
        >
          BOLETA ELECTRÓNICA
        </text>
        <line x1="86" y1="460" x2="274" y2="460" stroke="#dfe8f5" strokeDasharray="2 2" />
        <text x="86" y="476" fill="#5a6781" fontFamily="Inter, sans-serif" fontSize="8">
          Bebida 500ml
        </text>
        <text x="274" y="476" fill="#07112a" fontFamily="Inter, sans-serif" fontSize="8" textAnchor="end">
          $1.990
        </text>
        <text x="86" y="490" fill="#5a6781" fontFamily="Inter, sans-serif" fontSize="8">
          Snack chips
        </text>
        <text x="274" y="490" fill="#07112a" fontFamily="Inter, sans-serif" fontSize="8" textAnchor="end">
          $1.290
        </text>
        <text x="86" y="504" fill="#5a6781" fontFamily="Inter, sans-serif" fontSize="8">
          Recarga celular
        </text>
        <text x="274" y="504" fill="#07112a" fontFamily="Inter, sans-serif" fontSize="8" textAnchor="end">
          $11.710
        </text>
        <line x1="86" y1="510" x2="274" y2="510" stroke="#dfe8f5" />
        <text x="86" y="522" fill="#07112a" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700">
          TOTAL
        </text>
        <text x="274" y="522" fill="#07112a" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700" textAnchor="end">
          $14.990
        </text>
      </svg>

      {/* Glow decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[40%] bg-[radial-gradient(closest-side,rgba(31,85,189,0.28),transparent_70%)] blur-2xl"
      />
    </div>
  );
}

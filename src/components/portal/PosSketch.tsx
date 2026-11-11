// Terminal tipo Sunmi P3 en trazo morado "a mano" para las pantallas de acceso.
// SVG inline (sin fotos, decisión del sitio). El temblor del trazo lo da el
// filtro de desplazamiento; la boleta sale de la impresora una vez al cargar.
export default function PosSketch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 560"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="var(--mufin-700)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <filter id="pos-sketch" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
        {/* Solo se ve la boleta que ya salió por la ranura (y < 92). */}
        <clipPath id="pos-slot">
          <rect x="0" y="-40" width="300" height="132" />
        </clipPath>
      </defs>

      <g filter="url(#pos-sketch)">
        {/* Boleta */}
        <g clipPath="url(#pos-slot)">
          <g className="pos-ticket">
            <path
              d="M92 92 V8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l12 8 V92"
              fill="#fff"
            />
            <path d="M108 26 H160 M108 40 H190 M108 54 H176 M108 68 H150" strokeWidth="2" opacity=".6" />
          </g>
        </g>

        {/* Impresora */}
        <rect x="58" y="78" width="184" height="54" rx="16" fill="#fff" />
        <path d="M84 92 H216" strokeWidth="3" />

        {/* Cuerpo */}
        <rect x="38" y="118" width="224" height="404" rx="38" fill="#fff" />
        <path d="M262 210 v34 M262 262 v18" strokeWidth="4" />

        {/* Pantalla con un cobro */}
        <rect x="60" y="144" width="180" height="262" rx="16" fill="var(--mufin-bg)" />
        <path d="M80 172 H128" strokeWidth="2" opacity=".55" />
        <text
          x="80"
          y="222"
          fill="var(--mufin-900)"
          stroke="none"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontSize="30"
          fontWeight="700"
        >
          $12.500
        </text>
        <path d="M80 254 H218 M80 276 H196 M80 298 H208" strokeWidth="2" opacity=".35" />
        <rect x="80" y="338" width="140" height="44" rx="12" fill="var(--mufin-900)" stroke="var(--mufin-900)" />
        <text
          x="150"
          y="366"
          fill="#fff"
          stroke="none"
          textAnchor="middle"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontSize="15"
          fontWeight="600"
        >
          Cobrar
        </text>

        {/* Pago sin contacto */}
        <path d="M140 446 a14 14 0 0 1 0 22 M150 438 a26 26 0 0 1 0 38 M160 430 a38 38 0 0 1 0 54" />
        <circle cx="132" cy="457" r="3" fill="var(--mufin-700)" />

        {/* Empuñadura */}
        <rect x="104" y="500" width="92" height="40" rx="18" fill="#fff" />
      </g>
    </svg>
  );
}

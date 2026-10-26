import Image from "next/image";
import Reveal from "../Reveal";
import { whatsappLink } from "@/lib/site";

// Redes de pago con las que DTEx® está en proceso de certificación. Un solo
// bloque, no una sección por red: son un mismo mensaje ("con quién vas a poder
// cobrar") y separarlas hacía que lo no-disponible pesara más que lo vendible.
// Agregar una red = una entrada más en REDES, sin tocar el layout.
//
// Reglas mientras sigan en certificación:
//  - Copy en futuro y sin fechas. Nada de prometer disponibilidad.
//  - El disclaimer al pie es obligatorio: son marcas de terceros y su uso
//    identifica la red, no implica patrocinio ni respaldo.
//  - Cuando una se apruebe, el badge deja de ser uniforme: hay que agregar un
//    campo de estado a `Red` y mover su copy a presente. Si se aprueban varias,
//    esto puede volver a ser sección destacada y subir de posición.
//
// Solo logos, sin fotos de los terminales: las que hay públicas vienen de
// cuatro fuentes distintas (distinto fondo, ángulo y escala) y juntas se ven
// como un collage. Pendiente pedirle a cada proveedor sus fotos de producto;
// recién ahí agregar un campo `foto` a `Red`.
//
// Logos oficiales tomados de los sitios de cada empresa; no son material
// licenciado. Si alguna entrega su kit de marca, reemplazar el archivo.
type Red = {
  nombre: string;
  logo: string;
  /** Ancho/alto reales del archivo, para que next/image no deforme. */
  logoW: number;
  logoH: number;
  tipo: string;
  /** Terminal sobre el que opera la red, si tiene uno definido. */
  equipo?: string;
  desc: string;
  /** Altura óptica: los logos tienen proporciones distintas, así que a
   *  la misma altura en px no se ven del mismo tamaño. Ajustada a ojo. */
  alto: string;
};

const REDES: Red[] = [
  {
    nombre: "Compraquí de BancoEstado",
    logo: "/compraqui-logo.png",
    logoW: 290,
    logoH: 80,
    tipo: "Adquirencia + terminal",
    equipo: "Súper Compraquí",
    desc: "Podrás cobrar y emitir la boleta en el mismo equipo, con abono directo a tu cuenta BancoEstado.",
    alto: "h-9",
  },
  {
    nombre: "Mercado Pago",
    logo: "/mercadopago-logo.png",
    logoW: 284,
    logoH: 74,
    tipo: "Adquirencia + terminal",
    equipo: "Point Smart",
    desc: "Podrás cobrar con tarjeta y QR, con abono inmediato a tu cuenta de Mercado Pago.",
    alto: "h-8",
  },
  {
    nombre: "VirtualPos",
    logo: "/virtualpos-logo.svg",
    logoW: 414,
    logoH: 84,
    tipo: "Adquirencia + terminal",
    equipo: "Nexgo N86 Pro",
    desc: "Sumará cobro presencial y online: tarjetas, QR, transferencias y pagos recurrentes en una sola integración.",
    alto: "h-6",
  },
  {
    nombre: "Kushki",
    logo: "/kushki-logo.png",
    logoW: 938,
    logoH: 223,
    tipo: "Adquirencia + terminal",
    equipo: "Sunmi P3",
    desc: "Adquirente no bancario autorizado por la CMF, sobre el mismo Sunmi P3 que ya arrendamos.",
    alto: "h-7",
  },
];

export default function Redes() {
  return (
    <section
      id="redes"
      className="border-t border-border bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
              Redes de pago
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pronto, con más redes para cobrar.
            </h2>
            <p className="mt-4 text-base text-muted">
              Estamos certificando DTEx® con estas redes para que elijas con
              cuál operar, sin cambiar de sistema.
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REDES.map((r, i) => (
            <Reveal as="li" key={r.nombre} delay={i * 80}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-6">
                <div className="flex h-11 items-center">
                  <Image
                    src={r.logo}
                    alt={r.nombre}
                    width={r.logoW}
                    height={r.logoH}
                    className={`${r.alto} w-auto`}
                  />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted">
                  {r.tipo}
                </p>
                {r.equipo && (
                  <p className="mt-1 text-sm font-bold tracking-tight">
                    {r.equipo}
                  </p>
                )}
                <p className="mt-2 flex-1 text-sm text-muted">{r.desc}</p>

                <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  En certificación
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-col items-center gap-5">
            <a
              href={whatsappLink("redes")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-brand-300 px-6 py-3.5 text-sm font-semibold text-brand-700 transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-50"
            >
              Avísame cuando estén disponibles
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <p className="max-w-3xl text-center text-xs text-muted">
              Compraquí y BancoEstado son marcas de Banco del Estado de Chile;
              Mercado Pago, de MercadoLibre; VirtualPos, de Virtualpos SpA;
              Kushki, de Kushki Inc. Sus logotipos se muestran solo para
              identificar cada red y su uso no implica patrocinio ni respaldo.
              Ninguna tiene relación societaria con DTEx® ni MUFIN SpA. La
              disponibilidad depende de la aprobación de cada certificación y
              aún no tiene fecha comprometida.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

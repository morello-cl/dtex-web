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
  /** Terminal sobre el que opera la red, si tiene uno definido. */
  equipo?: string;
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
    equipo: "Súper Compraquí",
    alto: "h-9",
  },
  {
    nombre: "Mercado Pago",
    logo: "/mercadopago-logo.png",
    logoW: 284,
    logoH: 74,
    equipo: "Point Smart",
    alto: "h-8",
  },
  {
    nombre: "VirtualPos",
    logo: "/virtualpos-logo.svg",
    logoW: 414,
    logoH: 84,
    equipo: "Nexgo N86 Pro",
    alto: "h-6",
  },
  {
    nombre: "Kushki",
    logo: "/kushki-logo.png",
    logoW: 938,
    logoH: 223,
    equipo: "Sunmi P3",
    alto: "h-7",
  },
];

export default function Redes() {
  return (
    <section id="redes" className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Pronto, con más redes para cobrar.
              </h2>
              <p className="mt-3 text-base text-muted">
                Estamos certificando DTEx® con estas redes para que elijas con
                cuál operar, sin cambiar de sistema.
              </p>
              <a
                href={whatsappLink("redes")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
              >
                Avísame cuando estén disponibles
              </a>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {REDES.map((r) => (
                <li key={r.nombre} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
                  <div className="flex h-9 items-center">
                    <Image src={r.logo} alt={r.nombre} width={r.logoW} height={r.logoH} className={`${r.alto} w-auto`} />
                  </div>
                  <p className="text-sm text-muted">
                    {r.equipo ? <>Con {r.equipo}. </> : null}En certificación.
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 text-xs text-muted">
            Compraquí y BancoEstado son marcas de Banco del Estado de Chile;
            Mercado Pago, de MercadoLibre; VirtualPos, de Virtualpos SpA;
            Kushki, de Kushki Inc. Sus logotipos se muestran solo para
            identificar cada red y su uso no implica patrocinio ni respaldo.
            Ninguna tiene relación societaria con DTEx® ni MUFIN SpA. La
            disponibilidad depende de la aprobación de cada certificación y
            aún no tiene fecha comprometida.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

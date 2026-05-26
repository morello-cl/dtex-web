// Catálogo de equipos POS disponibles. Single source of truth — se usa
// tanto en la sección visual (Equipos.tsx) como en el JSON-LD de productos
// (ProductsJsonLd.tsx). Añadir un equipo aquí lo refleja en ambos lugares.

export type Spec = { label: string; value: string };
export type Availability = "sale-or-rent" | "rent-only";

export type Equipo = {
  /** Slug identificador estable. No usar para URLs por ahora. */
  id: string;
  model: string;
  brand: string;
  tagline: string;
  /** Descripción larga (para JSON-LD Product.description y posibles páginas
   *  futuras de detalle de equipo). */
  description: string;
  badge?: string;
  specs: Spec[];
  availability: Availability;
  /** Si highlight=true, la card se renderiza destacada. */
  highlight: boolean;
};

export const EQUIPOS: Equipo[] = [
  {
    id: "kozen-p8-neo",
    model: "Kozen P8 Neo",
    brand: "Kozen",
    tagline: "Handheld Android premium con escáner 1D/2D integrado.",
    description:
      "Terminal POS Android handheld Kozen P8 Neo con pantalla 6.52 pulgadas Gorilla Glass 5, escáner 1D/2D integrado, conectividad 4G y WiFi, batería 2500 mAh e impresora térmica de 58 mm. Diseño premiado iF Design.",
    specs: [
      { label: "Pantalla", value: '6.52" Gorilla 5' },
      { label: "Conexión", value: "4G + WiFi + NFC" },
      { label: "Batería", value: "2500 mAh" },
      { label: "Impresora", value: "58 mm térmica" },
    ],
    availability: "sale-or-rent",
    highlight: false,
  },
  {
    id: "sunmi-p3",
    model: "Sunmi P3",
    brand: "Sunmi",
    tagline: "Robusto y rápido, con grip ergonómico. Equipo de gama alta.",
    description:
      "Terminal POS Android Sunmi P3 de gama alta con pantalla 6.75 pulgadas HD, conectividad 4G + WiFi ac + Bluetooth 5.0, batería 2630 mAh e impresora térmica integrada de 58 mm a 70 mm/s. Lectores 1D/2D, chip, banda y NFC.",
    badge: "Más vendido",
    specs: [
      { label: "Pantalla", value: '6.75" HD' },
      { label: "Conexión", value: "4G + WiFi ac + BT 5.0" },
      { label: "Batería", value: "2630 mAh" },
      { label: "Impresora", value: "58 mm · 70 mm/s" },
    ],
    availability: "rent-only",
    highlight: true,
  },
  {
    id: "sunmi-d3-mini",
    model: "Sunmi D3 mini",
    brand: "Sunmi",
    tagline: "Mesón con doble pantalla: cajero y cliente a la vez.",
    description:
      "Terminal POS de mesón Sunmi D3 mini con doble pantalla (10.1 pulgadas táctil para el cajero + 4 pulgadas para el cliente), procesador Qualcomm hexa-core, Android 13, impresora térmica 58 o 80 mm y conectividad WiFi dual-band, Ethernet y USB.",
    specs: [
      { label: "Pantalla", value: '10.1" + 4" cliente' },
      { label: "Conexión", value: "WiFi · Ethernet · USB" },
      { label: "Sistema", value: "Android 13" },
      { label: "Impresora", value: "58 / 80 mm" },
    ],
    availability: "sale-or-rent",
    highlight: false,
  },
];

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  "sale-or-rent": "Venta o arriendo",
  "rent-only": "Solo arriendo",
};

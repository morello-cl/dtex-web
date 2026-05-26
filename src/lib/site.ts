// Configuración central del sitio. Reemplazar con datos definitivos cuando
// se reciba el brand kit y los números/correos comerciales reales.

export const site = {
  name: "DTEx®",
  legalName: "MUFIN SpA",
  tagline: "Convierte tu negocio en un punto de pagos y servicios.",
  description:
    "Acepta pagos con tarjeta, emite boletas electrónicas, cobra cuentas y recargas desde un solo equipo Android. Operado por Sencillito®.",
  url: "https://www.dtex.cl",

  // Solo dígitos: wa.me requiere el número internacional sin "+".
  whatsappNumber: "56971584901",
  email: "ventas@dtex.cl",
  emailLegal: "contacto@dtex.cl",
  emailMufin: "ventas@mufin.cl",

  // Datos corporativos de MUFIN SpA.
  mufinRut: "77.135.262-6",
  mufinAddress: {
    streetAddress: "Pedro de Valdivia 535, Oficina 1",
    addressLocality: "Villarrica",
    addressRegion: "Región de La Araucanía",
    addressCountry: "CL",
  },

  social: {
    instagram: "https://www.instagram.com/dtex.chile",
    facebook: "https://www.facebook.com/share/1AKqWSPvK7",
  },
} as const;

/** Dirección de MUFIN formateada en una línea (para mostrar inline). */
export function formattedMufinAddress(): string {
  const a = site.mufinAddress;
  return `${a.streetAddress}, ${a.addressLocality}, ${a.addressRegion}, Chile`;
}

type WaIntent = "info" | "quote" | "sencillito";

const WA_MESSAGES: Record<WaIntent, string> = {
  info: "Hola DTEx®, quiero más información sobre la plataforma para mi comercio.",
  quote: "Hola DTEx®, me gustaría cotizar un equipo POS Android.",
  sencillito:
    "Hola DTEx®, quiero activar Punto Sencillito® en mi comercio.",
};

export function whatsappLink(intent: WaIntent = "info"): string {
  const text = encodeURIComponent(WA_MESSAGES[intent]);
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}

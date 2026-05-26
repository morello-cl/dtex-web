import { site } from "@/lib/site";

type Qa = { q: string; a: string };

// Preguntas y respuestas pensadas para captar featured snippets en búsquedas
// típicas de comercios chilenos. Mantener respuestas en 2-4 oraciones, en
// español-CL, sin keyword stuffing.
const FAQ: Qa[] = [
  {
    q: "¿Puedo aceptar pagos con tarjeta de crédito y débito con DTEx®?",
    a: "Sí. Los equipos POS Android de DTEx® aceptan tarjetas de crédito, débito y prepago, incluyendo pagos con NFC o contactless desde el celular del cliente.",
  },
  {
    q: "¿El equipo emite boletas electrónicas válidas con el SII?",
    a: "Sí. DTEx® emite boletas y facturas electrónicas conforme a la normativa del Servicio de Impuestos Internos de Chile directamente desde el mismo equipo POS.",
  },
  {
    q: "¿Qué es Punto Sencillito® y qué ganan los comercios al activarlo?",
    a: "Punto Sencillito® convierte tu comercio en un punto autorizado para que tus clientes paguen cuentas (luz, agua, gas, internet) y hagan recargas. Cada operación atrae nuevos clientes que también compran en tu negocio, sumando ingresos por comisión y tráfico.",
  },
  {
    q: "¿Qué equipos POS están disponibles en DTEx®?",
    a: "Tres modelos Android: Kozen P8 Neo (venta o arriendo), Sunmi P3 (solo arriendo, gama alta) y Sunmi D3 mini (venta o arriendo, mesón con doble pantalla). Todos con impresora térmica integrada.",
  },
  {
    q: "¿Puedo arrendar el equipo en vez de comprarlo?",
    a: "Sí. El Kozen P8 Neo y el Sunmi D3 mini están disponibles en modalidad de venta o arriendo. El Sunmi P3, por su alto costo de adquisición, se ofrece solamente en arriendo.",
  },
  {
    q: "¿Cómo cotizo un equipo o solicito más información?",
    a: `Escribiendo por WhatsApp al +${site.whatsappNumber} o al correo ${site.email}. Te respondemos con la cotización del modelo que necesites y las condiciones de pago o arriendo.`,
  },
  {
    q: "¿DTEx® opera en todo Chile?",
    a: "Sí. DTEx® es operado por MUFIN SpA desde Villarrica, Región de La Araucanía, y atiende a comercios en todo el país.",
  },
];

// JSON-LD FAQPage: ayuda a captar featured snippets ("posición cero") en
// Google. Las preguntas reflejan búsquedas reales de comercios chilenos.
export default function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: { "@type": "Answer", text: qa.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

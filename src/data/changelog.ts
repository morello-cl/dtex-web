// Changelog del sitio dtex.cl. La primera entrada (índice 0) define la
// versión actual mostrada en el footer. Usamos SemVer: MAJOR.MINOR.PATCH.
//
// Convención editorial:
//  - Una entrada por release significativo. Cambios menores se agrupan.
//  - El texto es para visitantes del sitio (comercios), no para devs.
//  - "added" = funcionalidad nueva · "changed" = mejoras visibles
//  - "fixed" = correcciones · "removed" = funcionalidad retirada

export type ChangeType = "added" | "changed" | "fixed" | "removed";

export type Release = {
  version: string;
  /** Formato ISO: YYYY-MM-DD */
  date: string;
  /** Resumen corto opcional (1 línea) para destacar la versión. */
  summary?: string;
  changes: { type: ChangeType; description: string }[];
};

export const CHANGELOG: Release[] = [
  {
    version: "0.5.0",
    date: "2026-05-25",
    summary: "Más SEO: datos estructurados de productos y preguntas frecuentes.",
    changes: [
      {
        type: "added",
        description:
          "Cada equipo POS (Kozen P8 Neo, Sunmi P3, Sunmi D3 mini) ahora tiene datos estructurados de producto. Google podrá mostrar marca, modelo y disponibilidad para búsquedas relacionadas.",
      },
      {
        type: "added",
        description:
          "Preguntas frecuentes con datos estructurados (FAQ) para captar respuestas destacadas en Google sobre tarjetas, boletas electrónicas, Punto Sencillito® y arriendo.",
      },
      {
        type: "added",
        description:
          "Aviso de aceptación de Política de Privacidad y Términos junto a los botones principales de contacto.",
      },
      {
        type: "changed",
        description:
          "Título principal del sitio acortado para mostrarse completo en los resultados de Google.",
      },
      {
        type: "changed",
        description:
          "Descripciones para buscadores acortadas en las páginas de Novedades y Aviso Legal.",
      },
      {
        type: "changed",
        description:
          "Logo de Sencillito® con descripción accesible más completa.",
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-25",
    summary: "Mejoras de SEO y rendimiento.",
    changes: [
      {
        type: "changed",
        description:
          "Logo de DTEx® y de Sencillito® migrados a WebP. Tiempo de carga ~80% más rápido en estos recursos.",
      },
      {
        type: "changed",
        description:
          "Imagen de previsualización para redes sociales (Open Graph) optimizada: 501 KB → 51 KB.",
      },
      {
        type: "added",
        description:
          "Datos estructurados de migas de pan (BreadcrumbList) en páginas internas: Google podrá mostrar la ruta de navegación como rich snippet en los resultados.",
      },
      {
        type: "added",
        description:
          "Bloque 'Otros documentos legales' al final de cada página legal con enlaces cruzados.",
      },
      {
        type: "changed",
        description:
          "Metadescripciones y palabras clave optimizadas con foco en comercios chilenos (Villarrica, Araucanía, SII, almacenes, minimarkets).",
      },
      {
        type: "added",
        description:
          "Descripciones de accesibilidad (alt text) en los mockups de equipos POS Kozen P8 Neo, Sunmi P3 y Sunmi D3 mini.",
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-05-25",
    summary: "Datos corporativos de MUFIN incorporados y dominio oficial.",
    changes: [
      {
        type: "changed",
        description:
          "Datos corporativos reales de MUFIN SpA (RUT, domicilio en Villarrica) reemplazan los placeholders en las páginas legales y en los datos estructurados para Google.",
      },
      {
        type: "added",
        description:
          "Correo de contacto legal (contacto@dtex.cl) separado del comercial, para consultas sobre privacidad y términos.",
      },
      {
        type: "changed",
        description:
          "Dominio canónico del sitio actualizado a https://www.dtex.cl.",
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-25",
    summary: "Páginas legales y aviso corporativo.",
    changes: [
      {
        type: "added",
        description:
          "Política de Privacidad conforme a la Ley 19.628 chilena (en /privacidad).",
      },
      {
        type: "added",
        description:
          "Términos y Condiciones generales del sitio (en /terminos).",
      },
      {
        type: "added",
        description:
          "Términos específicos de arriendo de equipos POS (en /arriendo).",
      },
      {
        type: "added",
        description:
          "Aviso Legal con información corporativa de MUFIN SpA (en /aviso-legal).",
      },
      {
        type: "added",
        description:
          "Columna 'Legal' en el footer con acceso a todas las páginas legales.",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-25",
    summary:
      "Lanzamiento del sitio dtex.cl con la presentación oficial del producto.",
    changes: [
      {
        type: "added",
        description:
          "Landing comercial con presentación del producto: hero, beneficios, Punto Sencillito®, equipos POS, casos reales y CTA final.",
      },
      {
        type: "added",
        description:
          "Catálogo de equipos disponibles: Kozen P8 Neo (venta o arriendo), Sunmi P3 (solo arriendo) y Sunmi D3 mini (venta o arriendo).",
      },
      {
        type: "added",
        description:
          "Contacto directo por WhatsApp en cada CTA, con mensajes precargados según intención (información, cotización o activación de Sencillito®).",
      },
      {
        type: "added",
        description:
          "Sección dedicada a Punto Sencillito® con pagos de cuentas, recargas y servicios para atraer más clientes al comercio.",
      },
      {
        type: "added",
        description:
          "Página de novedades en /changelog con historial de cambios del sitio.",
      },
    ],
  },
];

/** Versión actual del sitio (primera entrada del changelog). */
export const SITE_VERSION = CHANGELOG[0].version;

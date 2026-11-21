// Changelog del sitio dtex.cl. La primera entrada (índice 0) define la
// versión actual mostrada en el footer. Usamos SemVer: MAJOR.MINOR.PATCH.
//
// Convención editorial:
//  - Una entrada por release significativo. Cambios menores se agrupan.
//  - El texto es para visitantes del sitio (comercios), no para devs.
//  - Sin jerga técnica (SEO, WebP, rutas, componentes, «paginador»): contar qué
//    cambió para el comercio y para qué le sirve, en palabras simples.
//  - Cada entrada lleva summary: es el titular de la versión en /changelog.
//  - "added" = funcionalidad nueva · "changed" = mejoras visibles
//  - "fixed" = correcciones · "removed" = funcionalidad retirada

export type ChangeType = "added" | "changed" | "fixed" | "removed";

export type Release = {
  version: string;
  /** Formato ISO: YYYY-MM-DD */
  date: string;
  /** Titular de la versión en /changelog: qué cambió para el comercio, en una línea. */
  summary: string;
  changes: { type: ChangeType; description: string }[];
};

export const CHANGELOG: Release[] = [
  {
    version: "0.21.0",
    date: "2026-11-20",
    summary: "Nueva portada: qué es DTEx® de un vistazo, con los colores de la marca.",
    changes: [
      {
        type: "changed",
        description: "La portada explica desde el inicio que DTEx® convierte tu negocio en un punto de pagos y servicios, y muestra la pantalla de cobro tal como la ves en el equipo.",
      },
      {
        type: "changed",
        description: "El sitio usa el morado de MUFIN, el mismo de la app y del Portal de pagos.",
      },
      {
        type: "added",
        description: "Nueva sección del Portal de pagos MUFIN: cómo revisar tus ventas y tus abonos desde cualquier lugar.",
      },
      {
        type: "changed",
        description: "Punto Sencillito® muestra qué cuentas y recargas pueden pagar tus clientes en tu local.",
      },
      {
        type: "removed",
        description: "Retiramos los testimonios y logos de ejemplo. Volverán cuando podamos mostrar casos reales de comercios.",
      },
    ],
  },
  {
    version: "0.20.0",
    date: "2026-11-20",
    summary: "Las ventas del día caben en una pantalla y el detalle abre con suavidad.",
    changes: [
      {
        type: "changed",
        description: "Las ventas del día se muestran de 10 en 10, y los botones para pasar de página están arriba de la lista, a la vista sin bajar.",
      },
      {
        type: "changed",
        description: "El resumen del día ocupa menos espacio: el total, lo vendido en efectivo y con tarjeta y las propinas se ven de una mirada. El detalle por tipo de tarjeta y por documento aparece al tocar «Ver desglose».",
      },
      {
        type: "changed",
        description: "Al abrir una venta o un abono, su detalle aparece deslizándose desde la derecha y se retira de la misma forma al cerrarlo.",
      },
      {
        type: "added",
        description: "El pie del portal muestra la versión actual. Al tocarla llegas a esta página, con las mejoras de cada versión.",
      },
    ],
  },
  {
    version: "0.19.1",
    date: "2026-11-19",
    summary: "Las ventas del día en el portal ahora se ven por páginas.",
    changes: [
      {
        type: "added",
        description: "La lista de ventas del día se divide en páginas de 25 ventas, con botones para pasar a la anterior o a la siguiente.",
      },
      {
        type: "changed",
        description: "Al ordenar las ventas por hora, monto u otro dato, se ordenan todas las ventas de la lista y no solo las de la página que estás viendo.",
      },
    ],
  },
  {
    version: "0.19.0",
    date: "2026-11-19",
    summary: "Abonos del portal más claros, con el mismo diseño de las ventas.",
    changes: [
      {
        type: "added",
        description: "Resumen del mes en los abonos del portal: total, pagados y pendientes de pago.",
      },
      {
        type: "added",
        description: "En el detalle de cada abono ves la marca de tarjeta de cada venta y puedes abrir esa venta.",
      },
      {
        type: "added",
        description: "Al compartir un enlace del portal por WhatsApp o correo, se ve una tarjeta con la marca MUFIN en lugar de un enlace sin imagen.",
      },
      {
        type: "changed",
        description: "Los abonos se ven en una tabla más ordenada, eliges el mes igual que eliges el día en las ventas y el detalle se abre a un costado sin salir de la lista.",
      },
    ],
  },
  {
    version: "0.18.0",
    date: "2026-11-18",
    summary: "Detalle de cada venta en el portal, con su estado en el SII.",
    changes: [
      {
        type: "added",
        description: "Cada venta del portal abre su detalle: el documento, los productos, cómo se pagó y si el SII ya lo recibió. Puedes copiar el número de seguimiento del SII (track ID) para consultarlo allá.",
      },
      {
        type: "added",
        description: "El inicio del portal muestra recomendaciones y la distribución de ventas por tipo de tarjeta y banco.",
      },
      {
        type: "added",
        description: "Calendario para elegir el día en las ventas del portal.",
      },
      {
        type: "changed",
        description: "La tabla de ventas tiene una columna por dato (documento, folio, medio, marca, tarjeta, sucursal, equipo y monto) y se puede ordenar por cualquiera.",
      },
      {
        type: "changed",
        description: "Las ventas con tarjeta muestran el logo de la marca y el detalle indica que el pago fue gestionado por MUFIN.",
      },
      {
        type: "fixed",
        description: "Los colores del portal son los mismos de la app MUFIN.",
      },
      {
        type: "fixed",
        description: "Los pagos que no se completaron ya no aparecen repetidos al cargar más ventas del día.",
      },
    ],
  },
  {
    version: "0.17.0",
    date: "2026-11-15",
    summary: "Las ventas del portal, en una tabla que puedes ordenar.",
    changes: [
      {
        type: "changed",
        description: "El detalle de ventas del portal se muestra como tabla y se puede ordenar por hora, documento, medio de pago o monto.",
      },
      {
        type: "fixed",
        description: "Las ventas con tarjeta prepago se muestran correctamente en el portal.",
      },
    ],
  },
  {
    version: "0.16.1",
    date: "2026-11-14",
    summary: "Más claro si una venta fue con débito o con crédito.",
    changes: [
      {
        type: "changed",
        description: "En las ventas con tarjeta se indica primero si fue débito o crédito.",
      },
    ],
  },
  {
    version: "0.16.0",
    date: "2026-11-12",
    summary: "Abonos en el Portal de pagos MUFIN.",
    changes: [
      {
        type: "added",
        description:
          "Abonos: revisa mes a mes lo que te depositamos por tus ventas con tarjeta, con el bruto vendido, la comisión, el IVA de la comisión, la regularización y el monto final, y si está pendiente o pagado y en qué fecha.",
      },
      {
        type: "added",
        description:
          "Abono disponible: el monto estimado de tus ventas con tarjeta que todavía no se envían al banco.",
      },
      {
        type: "added",
        description:
          "Detalle de cada abono con las ventas que lo componen, su comisión y las diferencias de días anteriores. El Inicio muestra tu próximo abono.",
      },
    ],
  },
  {
    version: "0.15.0",
    date: "2026-11-12",
    summary: "Inicio y ventas del día en el Portal de pagos MUFIN.",
    changes: [
      {
        type: "added",
        description:
          "Inicio del portal: lo vendido en los últimos 7 días, día por día, comparado con la semana anterior, hace 2 semanas, hace 1 mes, hace 2 meses o hace 1 año. Incluye cantidad de ventas, ticket promedio, porcentaje con tarjeta y hora de más venta.",
      },
      {
        type: "added",
        description:
          "Ventas del día: elige un día y revisa el total en efectivo y con tarjeta (crédito y débito), las propinas, los documentos emitidos y cada venta con su hora, documento, medio de pago y equipo. Puedes filtrar la lista por efectivo o tarjeta.",
      },
      {
        type: "added",
        description:
          "Los pagos rechazados y los cancelados por el cliente se muestran aparte y no suman ni restan a tus totales.",
      },
    ],
  },
  {
    version: "0.14.0",
    date: "2026-11-11",
    summary: "Portal de pagos MUFIN para comercios.",
    changes: [
      {
        type: "added",
        description:
          "Portal de pagos MUFIN: ingresa con el correo de tu empresa para revisar tus ventas y tus abonos. La primera vez te enviamos un enlace para activar tu cuenta y definir tu contraseña; con el mismo enlace la recuperas si la olvidas.",
      },
      {
        type: "added",
        description:
          "Si abres un enlace que ya usaste, que venció o que llegó incompleto, el portal te explica qué pasó y te deja pedir otro en la misma pantalla.",
      },
      {
        type: "added",
        description:
          "Acceso directo al Portal de pagos desde el menú y el pie de página del sitio.",
      },
      {
        type: "changed",
        description:
          "DTEx® se presenta como una aplicación MUFIN en el encabezado y el pie de página del sitio.",
      },
    ],
  },
  {
    version: "0.13.0",
    date: "2026-10-26",
    summary: "La guía App2App, lista para usarla con un asistente de inteligencia artificial.",
    changes: [
      {
        type: "added",
        description:
          "La guía App2App también está disponible como texto simple, para entregársela a un asistente de inteligencia artificial y que te ayude con la integración.",
      },
      {
        type: "added",
        description:
          "La documentación App2App muestra su número de revisión, para saber si estás leyendo la versión más reciente.",
      },
    ],
  },
  {
    version: "0.12.0",
    date: "2026-10-26",
    summary: "Guía App2App: cómo cobrar con vuelto.",
    changes: [
      {
        type: "added",
        description:
          "La documentación App2App explica cómo cobrar con vuelto: el cliente recibe efectivo y el monto se carga a su tarjeta junto con la compra.",
      },
      {
        type: "changed",
        description:
          "La documentación App2App aclara que la propina no lleva impuesto: el ticket o la boleta se emiten solo por el monto de la venta.",
      },
    ],
  },
  {
    version: "0.11.0",
    date: "2026-10-26",
    summary: "Guía App2App: ticket electrónico y descarga de folios.",
    changes: [
      {
        type: "added",
        description:
          "La documentación App2App explica cómo descargar folios de ticket o boleta desde tu app, sin mostrar DTEx® en pantalla.",
      },
      {
        type: "changed",
        description:
          "En App2App, el cobro emite un ticket electrónico cuando tu app no indica otro documento. El cajero confirma el pago directamente en la pantalla de la red de pago, sin un paso previo en DTEx®.",
      },
      {
        type: "changed",
        description:
          "La documentación App2App indica qué responde DTEx® cuando el comercio fue dado de baja.",
      },
    ],
  },
  {
    version: "0.10.0",
    date: "2026-10-26",
    summary:
      "Nueva sección para desarrolladores con la integración App2App.",
    changes: [
      {
        type: "added",
        description:
          "Nueva sección Desarrolladores: si tienes un sistema de gestión, de restaurante o de punto de venta, ahora puedes conectarlo con DTEx®. Con App2App, una aplicación instalada en el mismo equipo puede cobrar con tarjeta y emitir boletas. La conexión por internet y por cable USB está en desarrollo.",
      },
      {
        type: "fixed",
        description:
          "La marca DTEx® ahora lleva siempre su símbolo, también en los textos que leen los lectores de pantalla y los buscadores.",
      },
    ],
  },
  {
    version: "0.9.0",
    date: "2026-10-26",
    summary: "Carga de saldo de servicios con Mercado Pago.",
    changes: [
      {
        type: "added",
        description:
          "Ahora puedes cargar saldo para pagos de cuentas y recargas desde el enlace que te entrega tu equipo DTEx®. Revisas el monto, el costo del servicio y el total, y pagas con Mercado Pago. DTEx® no almacena los datos de tu tarjeta.",
      },
      {
        type: "added",
        description:
          "Páginas de resultado del pago que te indican si la carga fue aprobada, si sigue en proceso o si no se realizó, y qué hacer en cada caso.",
      },
    ],
  },
  {
    version: "0.8.0",
    date: "2026-10-26",
    summary:
      "Nueva imagen de DTEx® y las redes de pago con las que nos estamos certificando.",
    changes: [
      {
        type: "changed",
        description:
          "El logo y el ícono de DTEx® se actualizaron a la nueva imagen oficial de la marca, también en la imagen que aparece al compartir el sitio.",
      },
      {
        type: "added",
        description:
          "Nueva sección \"Redes de pago\": DTEx® está en proceso de certificación con Compraquí de BancoEstado, Mercado Pago, VirtualPos y Kushki, para que puedas elegir con cuál cobrar sin cambiar de sistema.",
      },
      {
        type: "changed",
        description:
          "El soporte para chino (中文) ya está disponible: tu equipo opera en español, portugués, inglés y chino.",
      },
      {
        type: "changed",
        description:
          "Portada más corta y ordenada: los equipos POS ahora aparecen antes, los casos de comercios se leen como un solo bloque y la lista de funciones se agrupó para que sea más fácil de recorrer.",
      },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-06-11",
    summary:
      "Nueva página para inscribir tu comercio y DTEx® en más idiomas.",
    changes: [
      {
        type: "added",
        description:
          "Nueva página para inscribir tu negocio en la red DTEx®. Completa los datos de la empresa y del representante legal en dos pasos guiados y te contactamos para coordinar la activación.",
      },
      {
        type: "added",
        description:
          "DTEx® ya está disponible en español, portugués e inglés. El soporte para chino llegará pronto.",
      },
      {
        type: "changed",
        description:
          "Por seguridad, la Clave SII y los datos bancarios para abonos ya no se solicitan por formulario web. Los coordinamos contigo por canal seguro durante la activación.",
      },
    ],
  },
  {
    version: "0.6.2",
    date: "2026-05-26",
    summary: "Ajuste visual del botón de envío del formulario.",
    changes: [
      {
        type: "fixed",
        description:
          "El botón \"Enviar mensaje\" del formulario de contacto ahora se muestra siempre en una sola línea.",
      },
    ],
  },
  {
    version: "0.6.1",
    date: "2026-05-26",
    summary: "Acceso más visible al formulario y mejoras de usabilidad.",
    changes: [
      {
        type: "added",
        description:
          "Acceso al formulario de contacto desde el botón principal de inicio y desde el llamado final de la página.",
      },
      {
        type: "changed",
        description:
          "El formulario ahora conserva lo que escribiste si hay un error al enviar, no necesitas volver a escribir nada.",
      },
      {
        type: "changed",
        description:
          "Los campos del formulario tienen un tamaño más cómodo, y en iPhone la pantalla ya no se agranda sola al tocarlos.",
      },
      {
        type: "changed",
        description:
          "Si falta un dato o hay un error, el formulario te lleva directo al campo que debes corregir, y los lectores de pantalla lo anuncian.",
      },
      {
        type: "added",
        description:
          "Texto que indica el horario de respuesta junto al botón de envío.",
      },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-05-26",
    summary: "Nueva página de contacto con formulario.",
    changes: [
      {
        type: "added",
        description:
          "Nueva página de contacto con un formulario para escribirnos sin salir del sitio. Los mensajes llegan directo al correo comercial y respondemos en horario hábil.",
      },
      {
        type: "added",
        description:
          "Acceso directo a Contacto desde el menú principal y desde el pie del sitio.",
      },
    ],
  },
  {
    version: "0.5.1",
    date: "2026-05-26",
    summary: "El sitio se lee mejor, también con lectores de pantalla.",
    changes: [
      {
        type: "changed",
        description:
          "Los botones principales usan un turquesa más oscuro para que su texto se lea mejor.",
      },
      {
        type: "fixed",
        description:
          "El pie del sitio se recorre mejor con lectores de pantalla.",
      },
      {
        type: "fixed",
        description:
          "Los lectores de pantalla anuncian el número de versión del sitio tal como se ve.",
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-05-25",
    summary: "DTEx® aparece mejor en Google.",
    changes: [
      {
        type: "added",
        description:
          "Cuando alguien busca un equipo POS (Kozen P8 Neo, Sunmi P3 o Sunmi D3 mini), Google puede mostrar su marca, modelo y disponibilidad.",
      },
      {
        type: "added",
        description:
          "Las respuestas a las preguntas frecuentes sobre tarjetas, boletas electrónicas, Punto Sencillito® y arriendo pueden aparecer directamente en Google.",
      },
      {
        type: "added",
        description:
          "Junto a los botones de contacto se indica que al escribirnos aceptas la Política de Privacidad y los Términos.",
      },
      {
        type: "changed",
        description:
          "Título principal del sitio acortado para mostrarse completo en los resultados de Google.",
      },
      {
        type: "changed",
        description:
          "Las páginas de Novedades y Aviso Legal se muestran completas en los resultados de Google.",
      },
      {
        type: "changed",
        description:
          "El logo de Sencillito® se describe mejor para los lectores de pantalla.",
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-25",
    summary: "El sitio carga más rápido y se encuentra mejor en Google.",
    changes: [
      {
        type: "changed",
        description:
          "Los logos de DTEx® y de Sencillito® cargan cerca de un 80 % más rápido.",
      },
      {
        type: "changed",
        description:
          "La imagen que aparece al compartir el sitio en redes sociales pesa diez veces menos y se muestra más rápido.",
      },
      {
        type: "added",
        description:
          "En los resultados de Google se ve en qué sección del sitio está cada página.",
      },
      {
        type: "added",
        description:
          "Al final de cada página legal hay enlaces a los demás documentos legales.",
      },
      {
        type: "changed",
        description:
          "Los textos que muestra Google están pensados para comercios chilenos, como almacenes y minimarkets.",
      },
      {
        type: "added",
        description:
          "Las ilustraciones de los equipos POS Kozen P8 Neo, Sunmi P3 y Sunmi D3 mini se describen para los lectores de pantalla.",
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-05-25",
    summary: "Datos de MUFIN SpA en las páginas legales y dirección oficial del sitio.",
    changes: [
      {
        type: "changed",
        description:
          "Las páginas legales muestran los datos de MUFIN SpA: su RUT y su domicilio en Villarrica.",
      },
      {
        type: "added",
        description:
          "Correo de contacto legal (contacto@dtex.cl) separado del comercial, para consultas sobre privacidad y términos.",
      },
      {
        type: "changed",
        description:
          "La dirección oficial del sitio es www.dtex.cl.",
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
          "Política de Privacidad conforme a la Ley 19.628 chilena.",
      },
      {
        type: "added",
        description:
          "Términos y Condiciones generales del sitio.",
      },
      {
        type: "added",
        description:
          "Términos específicos de arriendo de equipos POS.",
      },
      {
        type: "added",
        description:
          "Aviso Legal con información corporativa de MUFIN SpA.",
      },
      {
        type: "added",
        description:
          "El pie del sitio reúne el acceso a todas las páginas legales.",
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
          "El sitio de DTEx® presenta lo que ofrece a tu comercio: beneficios, Punto Sencillito®, equipos POS y casos de comercios reales.",
      },
      {
        type: "added",
        description:
          "Catálogo de equipos disponibles: Kozen P8 Neo (venta o arriendo), Sunmi P3 (solo arriendo) y Sunmi D3 mini (venta o arriendo).",
      },
      {
        type: "added",
        description:
          "Cada botón de contacto abre WhatsApp con un mensaje ya escrito según lo que necesitas: información, cotización o activación de Sencillito®.",
      },
      {
        type: "added",
        description:
          "Sección dedicada a Punto Sencillito® con pagos de cuentas, recargas y servicios para atraer más clientes al comercio.",
      },
      {
        type: "added",
        description:
          "Esta página de novedades, con el historial de cambios del sitio.",
      },
    ],
  },
];

/** Versión actual del sitio (primera entrada del changelog). */
export const SITE_VERSION = CHANGELOG[0].version;

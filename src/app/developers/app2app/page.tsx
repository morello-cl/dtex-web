import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import CodeTabs from "@/components/CodeTabs";
import { site } from "@/lib/site";
import { EXAMPLES, KEEP_ALIVE_KT } from "./examples";
import { DOC_REVISION } from "./revision";

// Fuente: docs/app2app.md del repo dtex_app2app. La sección interna
// "Para el equipo de DTEx®" (clases, endpoints del backend) no se publica.

export const metadata: Metadata = {
  title: "App2App — Integración Android",
  description:
    "Integra una app Android con DTEx® mediante App2App v1 para iniciar cobros con tarjeta, emitir boletas electrónicas y consultar transacciones.",
  alternates: {
    canonical: `${site.url}/developers/app2app`,
    types: { "text/markdown": `${site.url}/developers/app2app.md` },
  },
};

const TOC = [
  ["acciones", "Acciones disponibles"],
  ["como-funciona", "Cómo funciona"],
  ["requisitos", "Requisitos"],
  ["cobro", "Solicitud de cobro"],
  ["respuesta", "Respuesta y códigos de error"],
  ["idempotencia", "Idempotencia"],
  ["estado", "Consulta de estado"],
  ["despertar", "Despertar DTEx®"],
  ["mantener-listo", "Mantener DTEx® listo"],
  ["folios", "Descargar folios"],
  ["configuracion", "Abrir la Configuración"],
  ["activar", "Activar un equipo en caso de emergencia"],
  ["ejemplos", "Ejemplos"],
  ["autorizacion", "Solicitar autorización"],
] as const;

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Json({ title, children }: { title?: string; children: string }) {
  return (
    <figure className="code-block">
      {title && <figcaption>{title}</figcaption>}
      <pre>
        <code>{children}</code>
      </pre>
    </figure>
  );
}

// ¿Hubo cobro? Es lo que el integrador necesita ver primero en cada error.
const COBRO = {
  no: ["No", "cobro-no"],
  unknown: ["Desconocido", "cobro-unknown"],
  yes: ["Sí", "cobro-yes"],
} as const;

function Cobro({ v, children }: { v: keyof typeof COBRO; children?: ReactNode }) {
  const [label, cls] = COBRO[v];
  return (
    <>
      <span className={`cobro ${cls}`}>{label}</span>
      {children && <span className="mt-1 block text-sm">{children}</span>}
    </>
  );
}

// [acción, para qué, requiere autorización, sección]
const ACCIONES: [string, string, boolean, string][] = [
  ["PAYMENT", "Iniciar un cobro y, opcionalmente, emitir una boleta.", true, "cobro"],
  ["STATUS", "Consultar el estado de un cobro.", false, "estado"],
  ["WAKE_UP", "Preparar DTEx® antes de iniciar una venta.", false, "despertar"],
  ["KEEP_ALIVE", "Evitar que Android cierre DTEx® mientras tu app está visible.", false, "mantener-listo"],
  ["DOWNLOAD_FOLIOS", "Descargar folios de ticket o boleta sin mostrar DTEx®.", true, "folios"],
  ["SETTINGS", "Abrir la configuración de DTEx®.", true, "configuracion"],
  ["ACTIVATE", "Asociar a un comercio un equipo sin activar.", false, "activar"],
];

const FLUJO: { who: string; what: ReactNode }[] = [
  {
    who: "Tu app",
    what: (
      <>
        Inicia <code>action.PAYMENT</code> con el JSON <code>request</code>.
      </>
    ),
  },
  {
    who: "DTEx®",
    what: "Abre de inmediato el cobro del adquirente; el cajero confirma ahí. Luego emite la boleta.",
  },
  {
    who: "Tu app",
    what: (
      <>
        Recupera el control y recibe <code>response</code>:{" "}
        <code>{'"status": "APPROVED"'}</code>.
      </>
    ),
  },
];

const c = (s: string) => <code>{s}</code>;

function TocList() {
  return (
    <ol className="mt-3 space-y-1.5 text-sm">
      {TOC.map(([id, label]) => (
        <li key={id}>
          <a href={`#${id}`} className="text-muted hover:text-brand-700">
            {label}
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function App2AppPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Desarrolladores", href: "/developers" },
          { name: "App2App", href: "/developers/app2app" },
        ]}
      />
      <Navbar />
      <main className="flex-1">
        <header className="bg-brand-gradient">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <nav aria-label="Ruta" className="text-sm text-muted">
                <Link
                  href="/developers"
                  className="font-medium text-brand-600 hover:text-brand-800"
                >
                  Desarrolladores
                </Link>
                <span aria-hidden className="mx-2">/</span>
                App2App
              </nav>
              <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                Cobra con tarjeta desde tu app Android
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
                Desde una app instalada en el mismo terminal, inicia el cobro
                mediante un Intent y recibe el resultado en JSON. DTEx® procesa
                la tarjeta, emite la boleta y gestiona la impresión.
              </p>
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted">Contrato</dt>
                  <dd className="font-semibold text-brand-800">Versión 1</dd>
                </div>
                <div>
                  <dt className="text-muted">Revisión</dt>
                  <dd className="font-mono text-[13px] text-brand-800">
                    {DOC_REVISION}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Paquete</dt>
                  <dd className="font-mono text-[13px] text-brand-800">
                    dev.mufin.dtex
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">TUU Pro 2</dt>
                  <dd className="font-mono text-[13px] text-brand-800">
                    dev.mufin.dtex.tuu_pro2
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-muted">
                ¿Usas un asistente de IA?{" "}
                <a
                  href="/developers/app2app.md"
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  Abre esta documentación en Markdown
                </a>{" "}
                y entrégale el enlace o el archivo.
              </p>
            </div>

            <ol
              aria-label="Cómo funciona un cobro"
              className="flow rounded-3xl bg-brand-900 p-6 text-brand-50 sm:p-8"
            >
              {FLUJO.map((f, i) => (
                <li key={i} className="flow-step">
                  <span aria-hidden className="flow-dot">
                    {i + 1}
                  </span>
                  <span className="block text-sm font-semibold text-white">
                    {f.who}
                  </span>
                  <span className="mt-1 block text-sm text-brand-100">
                    {f.what}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <details className="docs-toc rounded-2xl border border-border p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-brand-800">
                En esta página
              </summary>
              <TocList />
            </details>
            <nav aria-label="En esta página" className="hidden lg:block">
              <p className="text-sm font-semibold text-brand-800">
                En esta página
              </p>
              <TocList />
            </nav>
          </aside>

        <article className="legal-prose min-w-0 max-w-3xl">
          <h2 id="acciones">Acciones disponibles</h2>
          <p>
            Todas se lanzan con el paquete de DTEx® y el prefijo{" "}
            {c("dev.mufin.dtex.action.")}.
          </p>
          <Table
            head={["Acción", "Para qué", "Requiere autorización"]}
            rows={ACCIONES.map(([a, d, auth, href]) => [
              <a key={a} href={`#${href}`}>
                {c(a)}
              </a>,
              d,
              auth ? "Sí" : "No",
            ])}
          />

          <h2 id="como-funciona">Cómo funciona</h2>

          <p>
            DTEx® pasa a primer plano y abre de inmediato el cobro con el
            adquirente configurado en el equipo; el cajero confirma o cancela
            en la pantalla del adquirente. Al finalizar, DTEx® devuelve el
            resultado y tu app recupera el control.
          </p>
          <p>
            Si tu app se cierra durante la operación, usa la{" "}
            <a href="#estado">consulta de estado</a> para saber en qué etapa
            quedó la transacción. Si Android cerró DTEx®, puedes{" "}
            <a href="#despertar">iniciarlo antes de la venta</a> para evitar
            que el cliente espere.
          </p>
          <p>
            Esta es la <strong>versión 1</strong> del contrato. Todos los campos
            JSON van en {c("snake_case")}.
          </p>

          <h2 id="requisitos">Requisitos</h2>
          <ul>
            <li>
              <strong>DTEx® instalado en el mismo equipo.</strong> El paquete es{" "}
              {c("dev.mufin.dtex")}. En terminales TUU Pro 2 es{" "}
              {c("dev.mufin.dtex.tuu_pro2")}.
            </li>
            <li>
              <strong>Versión compatible para usar vuelto.</strong> Antes de
              enviar {c("cashback")}, confirma con Mufin que el equipo tiene una
              versión compatible de DTEx® y la opción Vuelto habilitada.
            </li>
            <li>
              <strong>
                Equipo en modo integración y paquete Android autorizado.
              </strong>{" "}
              Mufin habilita el <em>modo integración</em> en cada equipo que
              usará tu app y registra el paquete Android de la aplicación
              integradora. Si el equipo no está en modo integración o el
              paquete no está autorizado, DTEx® responde{" "}
              {c("NOT_AUTHORIZED")}. Para pedirlo, ve a{" "}
              <a href="#autorizacion">Solicitar autorización</a>.
            </li>
            <li>
              <strong>
                DTEx® con permiso &ldquo;Mostrar sobre otras apps&rdquo;
              </strong>{" "}
              ({c("SYSTEM_ALERT_WINDOW")}), concedido en el equipo o por MDM.
              Algunos adquirentes, como Kushki ONE, dejan su pantalla encima al
              terminar el cobro, y sin este permiso Android no deja que DTEx®
              devuelva tu app al frente: la respuesta llega igual, pero recién
              cuando el operador vuelve a tu app.
            </li>
            <li>
              <strong>
                Llamar con {c("startActivityForResult")} o{" "}
                {c("registerForActivityResult")}.
              </strong>{" "}
              DTEx® identifica tu app con {c("getCallingPackage()")}, que solo
              existe cuando se pide un resultado. Una llamada con{" "}
              {c("startActivity")} responde {c("INVALID_REQUEST")}.
            </li>
            <li>
              <strong>Android 11+:</strong> declara{" "}
              {c('<queries><package android:name="dev.mufin.dtex"/></queries>')}{" "}
              en tu {c("AndroidManifest.xml")}. Es <strong>obligatorio</strong> para{" "}
              <a href="#mantener-listo">Mantener DTEx® listo</a>; para el resto
              de las acciones es opcional y sirve para comprobar si DTEx® está
              instalado antes de llamar.
            </li>
          </ul>

          <h2 id="cobro">Solicitud de cobro</h2>
          <p>
            Usa la acción {c("dev.mufin.dtex.action.PAYMENT")} con el paquete de
            DTEx®. El extra {c("request")} lleva un JSON:
          </p>
          <Json title="request · PAYMENT">{`{
  "version": 1,
  "request_id": "4f1c2b9e-6a0d-4a51-9c1e-2a7b0d3e8f11",
  "amount": 1500.00,
  "tip": 0,
  "cashback": 0,
  "currency": "CLP",
  "document": "cl_sii_boleta",
  "print": true
}`}</Json>
          <Table
            head={["Campo", "Tipo", "Descripción"]}
            rows={[
              [c("version"), "int", <>Siempre {c("1")}.</>],
              [
                c("request_id"),
                "string",
                "Identificador único de la solicitud (se recomienda un UUID). Guárdalo antes de llamar: lo necesitarás para consultar el estado.",
              ],
              [
                c("amount"),
                "number",
                <>
                  Monto sin propina. Admite decimales, pero en CLP debe ser
                  entero ({c("1500")} o {c("1500.00")}). Rango: 1 a 1.000.000.
                </>,
              ],
              [
                c("tip"),
                "number",
                <>
                  Propina; por defecto {c("0")}. Se suma al monto para calcular
                  el total del cobro. En CLP debe ser un entero no negativo. No
                  lleva impuesto: el ticket o la boleta se emiten solo por{" "}
                  {c("amount")}. Sí paga la comisión del adquirente, con el
                  mismo porcentaje que la venta.
                </>,
              ],
              [
                c("cashback"),
                "number",
                <>
                  Vuelto: efectivo que el comercio le entrega al cliente y que se
                  carga a la tarjeta junto con el monto; por defecto {c("0")}.
                  En CLP debe ser un entero no negativo. Igual que la propina,
                  no lleva impuesto y sí paga la comisión del adquirente. Está
                  disponible con todos los adquirentes; requiere una versión
                  compatible de DTEx® y la opción Vuelto activa en el equipo. Si
                  no está activa, responde {c("NOT_SUPPORTED")} sin cobrar.
                </>,
              ],
              [
                c("currency"),
                "string",
                <>Código ISO 4217. Esta versión solo acepta {c("CLP")}.</>,
              ],
              [
                c("document"),
                "string",
                <>
                  Qué genera DTEx® después del cobro (ver la tabla siguiente);
                  por defecto {c("ticket")}.
                </>,
              ],
              [
                c("print"),
                "bool",
                <>Si DTEx® imprime el documento; por defecto {c("false")}.</>,
              ],
            ]}
          />
          <h3>Valores de {c("document")}</h3>
          <Table
            head={["Valor", "Qué hace", "Con print: false"]}
            rows={[
              [
                c("none"),
                "Solo el cobro. Tu app emite su propio documento.",
                <>{c("print")} se ignora.</>,
              ],
              [
                c("ticket"),
                "Ticket electrónico (tipo 0): comprobante del pago, sin valor tributario. Su número es un contador interno de DTEx®, sin validez ante el adquirente ni el SII. Valor por defecto.",
                "Se emite sin imprimir.",
              ],
              [
                c("cl_sii_boleta"),
                "Boleta electrónica (tipo 39).",
                "Se emite sin imprimir.",
              ],
              [
                c("cl_sii_boleta_exenta"),
                "Boleta exenta (tipo 41).",
                "Se emite sin imprimir.",
              ],
            ]}
          />
          <p>
            Si pides un ticket o una boleta y el equipo no tiene folios de ese
            tipo, DTEx® intenta descargarlos; si no lo logra, responde{" "}
            {c("NO_FOLIO")} <strong>antes de cobrar</strong>.
          </p>

          <h2 id="respuesta">Respuesta y códigos de error</h2>
          <p>
            DTEx® responde {c("RESULT_OK")} e incluye el JSON en el extra{" "}
            {c("response")}. Solo recibirás {c("RESULT_CANCELED")} sin datos si
            el proceso de DTEx® se interrumpe durante la operación. En ese caso,
            usa la <a href="#estado">consulta de estado</a>.
          </p>
          <Json title="response · PAYMENT">{`{
  "version": 1,
  "request_id": "4f1c2b9e-6a0d-4a51-9c1e-2a7b0d3e8f11",
  "status": "APPROVED",
  "payment": {
    "acquirer": "Kushki",
    "auth_code": "123456",
    "last4": "****1234",
    "card_type": "credit",
    "sequence": "8f0a…",
    "ticket_number": "000123",
    "amount": 1500,
    "currency": "CLP"
  },
  "document": { "type": "cl_sii_boleta", "dte_type": 39, "folio": 4521, "printed": true }
}`}</Json>
          <Table
            head={["Campo", "Cuándo viene"]}
            rows={[
              [c("status"), "Siempre. Ver la tabla siguiente."],
              [
                <>
                  {c("error_code")}, {c("error_message")}
                </>,
                <>
                  Cuando ocurre un error. También puede venir junto con{" "}
                  {c("APPROVED")} (ver {c("DTE_FAILED")}).
                </>,
              ],
              [
                c("payment"),
                <>
                  Con {c("APPROVED")}. {c("acquirer")} es el nombre del
                  adquirente que procesó el cobro: depende del equipo y de las
                  reglas de Mufin. Pueden agregarse nuevos adquirentes sin aviso.
                  Guárdalo para conciliación, pero no lo uses para determinar si
                  hubo cobro ni lo compares con una lista fija.{" "}
                  {c("amount")} es el total cargado a la tarjeta: {c("amount")} +{" "}
                  {c("tip")} + {c("cashback")} de la solicitud.
                </>,
              ],
              [
                c("document"),
                <>
                  Con {c("APPROVED")}, si se pidió un documento y se generó. Con
                  un ticket:{" "}
                  {c('{"type": "ticket", "dte_type": 0, "folio": N, "printed": true|false}')}
                  .
                </>,
              ],
            ]}
          />
          <h3>Valores de {c("status")}</h3>
          <Table
            head={["status", "Significado"]}
            rows={[
              [c("APPROVED"), "El cobro fue aprobado."],
              [c("DECLINED"), "El adquirente rechazó la tarjeta. No hubo cobro."],
              [c("CANCELED"), "El cajero o el cliente canceló. No hubo cobro."],
              [
                c("ERROR"),
                <>
                  El cobro falló o no se puede confirmar su resultado. Revisa{" "}
                  {c("error_code")}.
                </>,
              ],
            ]}
          />
          <h3>Valores de {c("error_code")}</h3>
          <Table
            head={["Código", "¿Hubo cobro?", "Qué hacer"]}
            rows={[
              [
                c("INVALID_REQUEST"),
                <Cobro key="c" v="no" />,
                <>
                  Corrige la solicitud: JSON, versión, {c("request_id")},{" "}
                  {c("document")} o {c("print")}.
                </>,
              ],
              [
                c("INVALID_AMOUNT"),
                <Cobro key="c" v="no" />,
                "amount, tip o cashback no son numéricos, tienen decimales en CLP o son negativos; amount también debe estar entre 1 y 1.000.000.",
              ],
              [c("UNSUPPORTED_CURRENCY"), <Cobro key="c" v="no" />, "Moneda distinta de CLP."],
              [
                c("NOT_AUTHORIZED"),
                <Cobro key="c" v="no" />,
                <>
                  Tu paquete no está autorizado en este equipo o el equipo no
                  está en modo integración.{" "}
                  <a href="#autorizacion">Solicita la autorización</a>.
                </>,
              ],
              [
                c("BUSY"),
                <Cobro key="c" v="no" />,
                <>
                  DTEx® está procesando otra venta o solicitud. Reintenta en
                  unos segundos con el mismo {c("request_id")}.
                </>,
              ],
              [
                c("NOT_ACTIVATED"),
                <Cobro key="c" v="no" />,
                "El equipo no tiene un comercio activo o su registro está pendiente. Contacta a Mufin.",
              ],
              [
                c("NO_CONNECTION"),
                <Cobro key="c" v="no" />,
                "DTEx® no tiene internet ni datos del comercio guardados en el equipo.",
              ],
              [
                c("MERCHANT_NOT_ACTIVE"),
                <Cobro key="c" v="no" />,
                "El comercio fue dado de baja o su validación fue rechazada; DTEx® muestra el aviso y no emite. Contacta a Mufin. DTEx® revisa el estado del comercio en la sincronización diaria; sin conexión usa el último estado guardado, así que una baja reciente puede tardar hasta la próxima sincronización.",
              ],
              [
                c("NO_ACQUIRER"),
                <Cobro key="c" v="no" />,
                "El equipo no tiene habilitado el cobro con tarjeta.",
              ],
              [c("NO_FOLIO"), <Cobro key="c" v="no" />, "No hay folios para el documento pedido."],
              [
                c("NOT_SUPPORTED"),
                <Cobro key="c" v="no" />,
                <>
                  El comercio exige el RUT del receptor en la boleta (esta
                  versión no lo admite), o pediste {c("cashback")} y el equipo no
                  tiene el vuelto habilitado.
                </>,
              ],
              [
                c("TERMINAL_NOT_READY"),
                <Cobro key="c" v="no" />,
                "El terminal de pago no está listo para cobrar (configuración del adquirente).",
              ],
              [
                <>
                  {c("DECLINED")} / {c("CANCELED")}
                </>,
                <Cobro key="c" v="no" />,
                <>Revisa {c("error_message")}; contiene el detalle y el código del adquirente.</>,
              ],
              [
                c("INCOMPLETE"),
                <Cobro key="c" v="unknown" />,
                <>
                  Ese {c("request_id")} quedó incompleto en una ejecución anterior
                  (ver <a href="#idempotencia">Idempotencia</a>).
                </>,
              ],
              [
                c("ACQUIRER_ERROR"),
                <Cobro key="c" v="unknown" />,
                "Falló la comunicación con el adquirente. Revisa el cobro antes de reintentar.",
              ],
              [
                c("DTE_FAILED"),
                <Cobro key="c" v="yes">
                  Viene con {c("APPROVED")}
                </Cobro>,
                "El ticket o la boleta no se pudo emitir. No vuelvas a cobrar; emite el documento por tu cuenta.",
              ],
            ]}
          />

          <h2 id="idempotencia">Idempotencia</h2>
          <p>
            <strong>Un {c("request_id")} se procesa una sola vez.</strong> Desde
            que DTEx® muestra la pantalla de cobro, registra ese{" "}
            {c("request_id")} como procesado.
          </p>
          <ul>
            <li>
              Si lo repites cuando ya terminó, recibes la misma respuesta, sea
              cual sea su {c("status")}, sin que se vuelva a cobrar.
            </li>
            <li>
              Para un cobro nuevo, por ejemplo después de un {c("DECLINED")},
              usa un {c("request_id")} nuevo.
            </li>
            <li>
              Las solicitudes rechazadas antes de mostrar la pantalla no
              consumen el {c("request_id")} y se pueden repetir sin cambios.
              Esto incluye los errores de validación, {c("NOT_AUTHORIZED")} y{" "}
              {c("BUSY")}.
            </li>
            <li>
              Si repites un {c("request_id")} cuya ejecución se interrumpió
              durante el cobro o la emisión, recibes {c("INCOMPLETE")}. DTEx® no
              puede confirmar si hubo cobro: revísalo con el adquirente antes
              de usar otro {c("request_id")}.
            </li>
            <li>
              Si la ejecución se interrumpió antes de pedir la tarjeta (
              {c("preparing")}), no hubo cobro y DTEx® la procesa de nuevo.
            </li>
          </ul>

          <h2 id="estado">Consulta de estado</h2>
          <p>
            Si tu app se cerró mientras DTEx® procesaba el cobro, o recibiste{" "}
            {c("RESULT_CANCELED")} sin datos, consulta el resultado con la acción{" "}
            {c("dev.mufin.dtex.action.STATUS")}.
          </p>
          <ul>
            <li>
              <strong>Llamada:</strong> también con{" "}
              {c("startActivityForResult")}. Extra {c("request")}:{" "}
              {c('{"version": 1, "request_id": "..."}')}.
            </li>
            <li>
              <strong>Cómo responde:</strong> de inmediato y sin abrir DTEx® en
              primer plano, incluso si está cerrado.
            </li>
            <li>
              <strong>Alcance:</strong> solo devuelve las solicitudes creadas
              por tu misma app.
            </li>
          </ul>
          <Json title="response · STATUS">{`{
  "version": 1,
  "request_id": "4f1c2b9e-6a0d-4a51-9c1e-2a7b0d3e8f11",
  "stage": "completed",
  "updated_at": "2026-10-22T15:04:11Z",
  "response": { "status": "APPROVED", "payment": { "…": "…" } }
}`}</Json>
          <h3>Valores de {c("stage")}</h3>
          <Table
            head={["stage", "Qué significa", "Qué hacer"]}
            rows={[
              [
                c("not_found"),
                "DTEx® no comenzó a procesarla: no llegó, se rechazó antes de mostrar la pantalla o ya no está entre los últimos 50 registros.",
                <>Es seguro reintentar con el mismo {c("request_id")}.</>,
              ],
              [
                c("preparing"),
                "DTEx® la recibió y revisa adquirente y folios antes de pedir la tarjeta.",
                "Esperar y volver a consultar.",
              ],
              [
                c("charging"),
                "La tarjeta se está cobrando.",
                "Esperar y volver a consultar.",
              ],
              [
                c("issuing_document"),
                "Cobro aprobado; DTEx® está emitiendo o imprimiendo el documento.",
                "Esperar y volver a consultar.",
              ],
              [
                c("completed"),
                <>
                  La operación terminó. {c("response")} contiene la misma
                  respuesta completa que habría recibido tu app.
                </>,
                <>Usar {c("response")}.</>,
              ],
              [
                c("interrupted"),
                <>
                  El proceso de DTEx® se interrumpió. {c("last_stage")} indica
                  la última etapa alcanzada.
                </>,
                "Ver la tabla siguiente.",
              ],
            ]}
          />
          <h3>
            Valores de {c("last_stage")} en una solicitud {c("interrupted")}
          </h3>
          <Table
            head={["last_stage", "¿Hubo cobro?"]}
            rows={[
              [
                c("preparing"),
                <Cobro key="c" v="no">
                  Puedes reintentar con el mismo {c("request_id")}.
                </Cobro>,
              ],
              [
                c("charging"),
                <Cobro key="c" v="unknown">
                  Revisa con el adquirente.
                </Cobro>,
              ],
              [
                c("issuing_document"),
                <Cobro key="c" v="yes">
                  El documento puede no haberse emitido.
                </Cobro>,
              ],
            ]}
          />
          <p>
            Si la consulta no es válida (por ejemplo, no incluye{" "}
            {c("request_id")}), DTEx® responde{" "}
            {c('{"status": "ERROR", "error_code": "INVALID_REQUEST", ...}')}.
            DTEx® conserva las últimas 50 solicitudes por equipo.
          </p>

          <h2 id="despertar">Despertar DTEx®</h2>
          <p>
            Android puede cerrar DTEx® después de un tiempo en segundo plano.
            Aunque el cobro funcionará, el cliente tendrá que esperar el arranque
            y, si la sesión venció, el inicio de sesión. Usa {c("WAKE_UP")} antes
            de la venta para evitar esa espera.
          </p>
          <ul>
            <li>
              <strong>Llamada:</strong> acción{" "}
              {c("dev.mufin.dtex.action.WAKE_UP")}, con{" "}
              {c("startActivityForResult")}. No lleva extras.
            </li>
            <li>
              <strong>Si DTEx® ya está listo:</strong> responde de inmediato y
              permanece en segundo plano.
            </li>
            <li>
              <strong>Si aún no está listo:</strong> DTEx® se abre, arranca y
              solicita el inicio de sesión si es necesario. Al llegar a la
              pantalla principal, responde y devuelve el control a tu app.
            </li>
            <li>
              <strong>Respuesta:</strong> {c('{"version": 1, "status": "READY"}')}
              . Si hay un cobro en curso,{" "}
              {c('{"status": "ERROR", "error_code": "BUSY", ...}')}. Si el equipo
              no puede cobrar, {c("NOT_ACTIVATED")},{" "}
              {c("MERCHANT_NOT_ACTIVE")} o {c("NO_CONNECTION")}: DTEx® queda en
              la pantalla que explica el problema y devuelve el error a tu
              app sin dejar la solicitud pendiente.
            </li>
            <li>
              <strong>No requiere</strong> que tu paquete esté autorizado: no
              cobra ni entrega datos.
            </li>
          </ul>
          <p>
            <strong>Cuándo llamarlo:</strong> si usas{" "}
            <a href="#mantener-listo">Mantener DTEx® listo</a>, solo cuando la
            conexión indique que no está listo. Si no usas esa conexión, llámalo
            al iniciar tu app, abrir la caja o comenzar una venta, antes de que
            el cliente pague. No lo llames desde{" "}
            {c("onResume")}: la respuesta de DTEx® vuelve a disparar{" "}
            {c("onResume")} y provocaría un ciclo.
          </p>

          <h2 id="mantener-listo">Mantener DTEx® listo</h2>
          <div className="legal-note">
            <strong>Importante:</strong> en terminales con poca memoria, como el
            P2 SE, Android puede cerrar DTEx® cuando queda en segundo plano. El
            siguiente cobro podría tardar unos 20 segundos mientras la app
            vuelve a iniciar. Mantén la conexión mientras tu app esté visible
            para evitar esa espera.
          </div>
          <ul>
            <li>
              <strong>Llamada:</strong> {c("bindService")} con la acción{" "}
              {c("dev.mufin.dtex.action.KEEP_ALIVE")} y{" "}
              {c("BIND_AUTO_CREATE")}. Conéctate en {c("onStart")} y
              desconéctate en {c("onStop")}.
            </li>
            <li>
              <strong>Efecto:</strong> Android asigna a DTEx® la misma prioridad
              que a tu app y evita cerrarlo por falta de memoria. Así, el
              siguiente cobro no necesita esperar el arranque.
            </li>
            <li>
              <strong>Consultar si DTEx® está listo:</strong> al conectar recibes
              un {c("IBinder")}. La transacción{" "}
              {c("IBinder.FIRST_CALL_TRANSACTION")} responde un {c("int")}:{" "}
              {c("1")} si DTEx® está listo para cobrar y {c("0")} si no. La
              conexión inicia el proceso de DTEx® si estaba cerrado, sin mostrar
              su pantalla principal. Si recibes {c("0")}, llama a{" "}
              <a href="#despertar">{c("WAKE_UP")}</a>.
            </li>
            <li>
              <strong>Si DTEx® se cierra mientras estás conectado</strong> (por
              ejemplo, porque falló): recibes {c("onServiceDisconnected")}. Llama
              a {c("WAKE_UP")} en ese momento, no en el próximo cobro.
            </li>
            <li>
              <strong>Evita llamadas repetidas:</strong> si {c("WAKE_UP")} no
              responde {c("READY")} porque el equipo está sin activar, el
              comercio fue dado de baja o no hay conexión, espera una acción del operador antes de volver a llamar.
            </li>
            <li>
              <strong>No requiere</strong> que tu paquete esté autorizado: no
              cobra ni entrega datos.
            </li>
            <li>
              <strong>Android 11 o superior:</strong> aquí {c("<queries>")} es
              obligatorio (ver <a href="#requisitos">Requisitos</a>). Sin él,
              Android no permite descubrir el servicio y {c("bindService")} devuelve{" "}
              {c("false")}.
            </li>
            <li>
              Esta conexión <strong>reemplaza</strong> la llamada a {c("WAKE_UP")}{" "}
              al iniciar tu app.
            </li>
          </ul>
          <Json title="Kotlin · KEEP_ALIVE">{KEEP_ALIVE_KT}</Json>

          <h2 id="folios">Descargar folios</h2>
          <p>
            Tu app puede pedirle a DTEx® que descargue folios de un tipo de
            documento (ticket electrónico, boleta o boleta exenta), por ejemplo al abrir la caja o cuando quedan pocos. DTEx®
            descarga en segundo plano, sin pasar al frente, y responde cuántos
            folios quedan disponibles.
          </p>
          <ul>
            <li>
              <strong>Llamada:</strong> acción{" "}
              {c("dev.mufin.dtex.action.DOWNLOAD_FOLIOS")}, con{" "}
              {c("startActivityForResult")} y el extra {c("request")}.
            </li>
            <li>
              <strong>{c("document")}:</strong> {c("ticket")} (ticket
              electrónico, tipo 0), {c("cl_sii_boleta")} (tipo 39) o{" "}
              {c("cl_sii_boleta_exenta")} (tipo 41). Son los mismos nombres del
              cobro. Cualquier otro valor responde{" "}
              {c("INVALID_REQUEST")}.
              <br />
              {c("ticket")} es el más común, porque es el documento que DTEx®
              emite por defecto en cada cobro.
            </li>
            <li>
              <strong>{c("available")}:</strong> folios disponibles después de
              descargar. Si no se entregaron folios nuevos o no hubo conexión,
              es la cantidad que ya había en el equipo.
            </li>
            <li>
              <strong>Errores:</strong> {c("NOT_AUTHORIZED")} si tu paquete no
              está autorizado, {c("BUSY")} si DTEx® está emitiendo o cobrando, y{" "}
              {c("NOT_ACTIVATED")}, {c("MERCHANT_NOT_ACTIVE")} o{" "}
              {c("NO_CONNECTION")} si el equipo no puede operar.
            </li>
            <li>
              <strong>Si DTEx® no está listo</strong> (cerrado o arrancando),
              pasa al frente, arranca y descarga al llegar a la pantalla
              principal. Con <a href="#mantener-listo">Mantener DTEx® listo</a>{" "}
              esto no ocurre.
            </li>
            <li>
              <strong>Mientras descarga</strong>, tu app sigue visible pero no
              recibe toques. Suele tardar unos segundos.
            </li>
          </ul>
          <Json title="request · DOWNLOAD_FOLIOS">{`{"version": 1, "document": "ticket"}`}</Json>
          <Json title="response · DOWNLOAD_FOLIOS">{`{"version": 1, "status": "OK", "document": "ticket", "available": 120}`}</Json>
          <p>
            No hace falta llamarla antes de cada boleta: si al cobrar no hay
            folios, DTEx® los descarga solo y, si aun así no hay, responde{" "}
            {c("NO_FOLIO")} sin cobrar.
          </p>

          <h2 id="configuracion">Abrir la Configuración de DTEx®</h2>
          <p>
            Tu app puede llevar al operador directamente a la Configuración de DTEx®
            (venta exprés, propina, copias de impresión, documento por defecto,
            folios, etc.) con la acción {c("dev.mufin.dtex.action.SETTINGS")}.
          </p>
          <ul>
            <li>
              <strong>Llamada:</strong> con {c("startActivityForResult")}. No
              lleva extras.
            </li>
            <li>
              <strong>Requiere</strong> que tu paquete esté autorizado, igual
              que el cobro.
            </li>
            <li>
              <strong>Qué ocurre:</strong> DTEx® se abre en la pantalla de
              Configuración. Cuando el operador sale, tu app recupera el control.
            </li>
            <li>
              <strong>Actualizar datos:</strong> cuando se abre desde tu app, la
              Configuración muestra al inicio la opción <em>Actualizar datos</em>.
              Esta vuelve a descargar los datos del comercio, los folios y la
              configuración del equipo, igual que <em>Empresa › Actualizar</em>{" "}
              dentro de DTEx®.
            </li>
            <li>
              <strong>Descargar folios:</strong> esta opción también aparece al
              inicio y abre la pantalla de folios de DTEx®. Allí se muestra
              cuántos quedan de cada tipo (boleta, boleta exenta y ticket) y el
              operador puede descargar los que necesite.
            </li>
            <li>
              <strong>Respuesta:</strong> {c('{"version": 1, "status": "OK"}')}.
              Errores posibles: {c("NOT_AUTHORIZED")}, {c("BUSY")} (DTEx® en
              medio de una venta), {c("NOT_ACTIVATED")},{" "}
              {c("MERCHANT_NOT_ACTIVE")} o {c("NO_CONNECTION")}.
            </li>
            <li>
              La Configuración conserva la misma protección que cuando se abre
              desde el menú de DTEx®.
            </li>
          </ul>

          <h2 id="activar">Activar un equipo en caso de emergencia</h2>
          <p>
            Usa esta acción solo si un equipo se instaló sin activar. Tu app
            indica a qué comercio pertenece y DTEx® lo asocia de inmediato.
          </p>
          <ul>
            <li>
              <strong>Llamada:</strong> acción{" "}
              {c("dev.mufin.dtex.action.ACTIVATE")}, con{" "}
              {c("startActivityForResult")}. Extra {c("request")}:{" "}
              {c('{"version": 1, "commerce_rut": "77135262-6"}')} (RUT con guion
              y dígito verificador; con o sin puntos).
            </li>
            <li>
              <strong>Qué hace DTEx®:</strong> registra el equipo en el comercio
              indicado con la serie, la marca, el modelo, la versión de DTEx® y
              el paquete de tu app. Luego reinicia el flujo hasta llegar a la
              pantalla principal.
            </li>
            <li>
              <strong>No requiere</strong> autorización ni modo integración: un
              equipo sin activar todavía no tiene perfil.
            </li>
            <li>
              <strong>Datos del chip:</strong> DTEx® no los envía. Se asignan
              desde el dashboard.
            </li>
          </ul>
          <p>
            {c("ACTIVATED")} y {c("ALREADY_ACTIVE")} traen el terminal y la
            fecha de alta del equipo:
          </p>
          <Json title="response · ACTIVATE">{`{"version": 1, "status": "ACTIVATED", "tid": "30054774", "activated_at": "2026-10-23T13:13:30Z"}`}</Json>
          <p>
            {c("activated_at")} va en ISO 8601 UTC y{" "}
            <strong>puede venir {c("null")}</strong> si DTEx® aún no la conoce.
            Tu app debe aceptar ambos casos.
          </p>
          <Table
            head={["status / error_code", "Cuándo"]}
            rows={[
              [
                c("ACTIVATED"),
                "El equipo quedó asociado y llegó a la pantalla principal.",
              ],
              [c("ALREADY_ACTIVE"), "El equipo ya estaba activo."],
              [c("MERCHANT_NOT_FOUND"), "El RUT no está registrado en DTEx®."],
              [
                c("MERCHANT_NOT_ACTIVE"),
                "El comercio existe pero no está activo.",
              ],
              [
                c("MERCHANT_WITHOUT_HEADQUARTERS"),
                "El comercio no tiene casa matriz donde asociar el equipo. Corrígelo en el dashboard.",
              ],
              [
                c("SERIAL_IN_OTHER_MERCHANT"),
                "El equipo pertenece a otro comercio. Reasígnalo desde el dashboard.",
              ],
              [c("INVALID_REQUEST"), <>Falta {c("commerce_rut")}.</>],
              [
                c("NO_CONNECTION"),
                "DTEx® no pudo conectarse con el servidor.",
              ],
              [
                c("VALIDATION_ERROR"),
                <>
                  El RUT u otro dato no es válido; {c("error_message")} trae el
                  detalle.
                </>,
              ],
              [
                c("ACTIVATION_FAILED"),
                <>
                  Ocurrió un error sin código específico, por ejemplo, si el
                  servidor no está disponible. {c("error_message")} contiene el detalle.
                </>,
              ],
            ]}
          />

          <h2 id="ejemplos">Ejemplos</h2>
          <p>Los tres ejemplos hacen lo mismo:</p>
          <ol>
            <li>
              Generan y guardan el {c("request_id")}.
            </li>
            <li>Piden el cobro.</li>
            <li>Si no llega respuesta, consultan el estado.</li>
            <li>Despiertan DTEx® antes de la venta.</li>
          </ol>
          <p>
            Flutter y React Native no exponen directamente una API para recibir
            el resultado y los extras de otra Activity. Los ejemplos usan un
            módulo nativo pequeño ({c("MethodChannel")} o {c("NativeModules")})
            que abre la Activity y devuelve el extra {c("response")}.
          </p>
          <CodeTabs tabs={EXAMPLES} />
          <p>
            En{" "}
            <a href="https://github.com/morello-cl/dtex_app2app_demo">
              github.com/morello-cl/dtex_app2app_demo
            </a>{" "}
            hay una app Android completa, con licencia MIT, para probar la
            integración en un terminal: cobro, reintento, consulta de estado,{" "}
            {c("WAKE_UP")}, {c("KEEP_ALIVE")}, activación, descarga de folios y
            configuración.
          </p>

          <h2 id="autorizacion">Solicitar autorización</h2>
          <p>
            Para cobrar, descargar folios y abrir la Configuración, el paquete
            Android debe estar
            autorizado y cada equipo debe tener habilitado el modo integración.
            Solicita la habilitación mediante el formulario de contacto e indica:
          </p>
          <ul>
            <li>
              El nombre de tu app y su paquete Android (por ejemplo,{" "}
              {c("cl.miempresa.caja")}).
            </li>
            <li>El comercio o los comercios donde se usará (RUT).</li>
            <li>Los equipos que trabajarán con tu app, si ya los conoces.</li>
          </ul>
          <p>
            <Link href="/contacto">Solicitar autorización</Link>
          </p>
        </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

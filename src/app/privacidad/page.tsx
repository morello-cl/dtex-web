import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { formattedMufinAddress, site } from "@/lib/site";

const LAST_UPDATED = "2026-05-25";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de DTEx® conforme a la Ley 19.628 chilena. Cómo MUFIN SpA recolecta, trata y protege tus datos como comerciante.",
  alternates: { canonical: `${site.url}/privacidad` },
};

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="placeholder">{children}</span>
);

export default function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      lastUpdated={LAST_UPDATED}
      breadcrumb={{ name: "Política de Privacidad", href: "/privacidad" }}
      intro={`En ${site.name} respetamos tu privacidad. Esta política explica qué datos recolectamos, cómo los usamos y los derechos que te asisten conforme a la legislación chilena vigente.`}
    >
      <div className="legal-note">
        <strong>Aviso:</strong> Esta es una plantilla base. El contenido debe
        ser revisado por el equipo legal de {site.legalName} antes de ser
        publicado oficialmente. Los textos entre{" "}
        <Placeholder>[CORCHETES]</Placeholder> son datos que deben completarse.
      </div>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales recolectados a
        través de este sitio es <strong>{site.legalName}</strong>, RUT{" "}
        <strong>{site.mufinRut}</strong>, con domicilio en{" "}
        {formattedMufinAddress()}.
      </p>
      <p>
        Para consultas sobre privacidad o el ejercicio de tus derechos,
        contáctanos en{" "}
        <a href={`mailto:${site.emailLegal}`}>{site.emailLegal}</a>.
      </p>

      <h2>2. Datos personales que recolectamos</h2>
      <p>
        Recolectamos los siguientes datos personales únicamente cuando tú
        decides compartirlos con nosotros:
      </p>
      <ul>
        <li>
          <strong>Datos de contacto:</strong> nombre, número de teléfono, correo
          electrónico, nombre del comercio, ciudad o comuna.
        </li>
        <li>
          <strong>Conversaciones por WhatsApp:</strong> el contenido de los
          mensajes que nos envías a través de nuestros canales comerciales.
        </li>
        <li>
          <strong>Datos técnicos:</strong> dirección IP, tipo de navegador,
          dispositivo y datos de navegación general necesarios para el
          funcionamiento del sitio.
        </li>
      </ul>
      <p>
        Este sitio <strong>no utiliza formularios web</strong> para captar tus
        datos: el contacto se realiza directamente por WhatsApp. Por lo tanto,
        la información que compartas será tratada bajo nuestras políticas y
        también bajo la política de privacidad del proveedor de mensajería.
      </p>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Utilizamos tus datos personales únicamente para:</p>
      <ul>
        <li>Responder a tus consultas comerciales.</li>
        <li>Cotizar y entregar equipos POS y servicios asociados.</li>
        <li>Activar y operar el Punto Sencillito® en tu comercio.</li>
        <li>Cumplir con obligaciones legales, contables y tributarias.</li>
        <li>
          Enviarte información relacionada con productos contratados (solo si
          existe relación comercial activa).
        </li>
      </ul>
      <p>
        No usamos tus datos para enviar publicidad masiva no solicitada, ni los
        compartimos con terceros para fines comerciales ajenos al servicio.
      </p>

      <h2>4. Base legal del tratamiento</h2>
      <p>
        El tratamiento se realiza conforme a la{" "}
        <strong>Ley N° 19.628</strong> sobre Protección de la Vida Privada y,
        cuando entre en plena vigencia, conforme a la nueva normativa chilena
        de protección de datos personales. La base legal incluye:
      </p>
      <ul>
        <li>
          Tu <strong>consentimiento</strong> al contactarnos por WhatsApp o
          correo.
        </li>
        <li>
          La <strong>ejecución de un contrato</strong> cuando contratas un
          equipo o servicio.
        </li>
        <li>
          El <strong>cumplimiento de obligaciones legales</strong> aplicables a{" "}
          {site.legalName}.
        </li>
      </ul>

      <h2>5. Conservación de los datos</h2>
      <p>
        Conservamos tus datos personales mientras exista una relación comercial
        activa y, posteriormente, durante el plazo que exija la legislación
        chilena (en general, hasta{" "}
        <Placeholder>[X años]</Placeholder> tras el término de la relación,
        para fines contables y tributarios).
      </p>

      <h2>6. Tus derechos como titular</h2>
      <p>
        En cualquier momento puedes ejercer los siguientes derechos sobre tus
        datos personales:
      </p>
      <ul>
        <li>
          <strong>Acceso:</strong> conocer qué datos tuyos tenemos.
        </li>
        <li>
          <strong>Rectificación:</strong> corregir datos inexactos o
          incompletos.
        </li>
        <li>
          <strong>Cancelación:</strong> eliminar tus datos cuando la ley lo
          permita.
        </li>
        <li>
          <strong>Oposición:</strong> oponerte al tratamiento por motivos
          legítimos.
        </li>
        <li>
          <strong>Portabilidad:</strong> recibir tus datos en un formato
          estructurado.
        </li>
      </ul>
      <p>
        Para ejercer estos derechos, escríbenos a{" "}
        <a href={`mailto:${site.emailLegal}`}>{site.emailLegal}</a> indicando
        claramente tu solicitud. Te responderemos dentro de los plazos legales.
      </p>

      <h2>7. Cookies y tecnologías similares</h2>
      <p>
        Actualmente este sitio <strong>no utiliza cookies de seguimiento</strong>{" "}
        ni herramientas de analítica de terceros. Si en el futuro las
        incorporamos, actualizaremos esta política y solicitaremos tu
        consentimiento cuando corresponda.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Implementamos medidas técnicas y organizacionales razonables para
        proteger tus datos personales contra acceso no autorizado, pérdida o
        alteración. Sin embargo, ninguna transmisión por internet es
        completamente segura, y no podemos garantizar seguridad absoluta.
      </p>

      <h2>9. Transferencias internacionales</h2>
      <p>
        Algunos servicios que utilizamos (por ejemplo, WhatsApp,
        proveedores de hosting) pueden tratar datos fuera de Chile. En esos
        casos, exigimos a nuestros proveedores estándares equivalentes a los
        contemplados por la legislación chilena.
      </p>

      <h2>10. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios legales o
        operativos. Cuando lo hagamos, publicaremos la nueva versión en esta
        misma página e indicaremos la fecha de actualización al inicio del
        documento.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Si tienes preguntas sobre esta política, escríbenos a{" "}
        <a href={`mailto:${site.emailLegal}`}>{site.emailLegal}</a>.
      </p>
    </LegalLayout>
  );
}

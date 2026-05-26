import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { site } from "@/lib/site";

const LAST_UPDATED = "2026-05-25";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de DTEx®: POS Android, boletas electrónicas SII, Punto Sencillito® y servicios de pagos para comercios chilenos.",
  alternates: { canonical: `${site.url}/terminos` },
};

export default function TerminosPage() {
  return (
    <LegalLayout
      title="Términos y Condiciones"
      lastUpdated={LAST_UPDATED}
      breadcrumb={{ name: "Términos y Condiciones", href: "/terminos" }}
      intro={`Términos generales de uso del sitio ${site.name} y de la información comercial que aquí se presenta.`}
    >
      <div className="legal-note">
        <strong>Aviso:</strong> Esta es una plantilla base. El contenido debe
        ser revisado por el equipo legal de {site.legalName} antes de ser
        publicado oficialmente. Para condiciones específicas de arriendo de
        equipos, consulta la página{" "}
        <a href="/arriendo">Términos de arriendo</a>.
      </div>

      <h2>1. Aceptación</h2>
      <p>
        Al acceder y utilizar el sitio <strong>{site.url}</strong>, aceptas en
        forma íntegra y sin reservas estos Términos y Condiciones. Si no estás
        de acuerdo con alguna parte, abstente de utilizar el sitio.
      </p>

      <h2>2. Definiciones</h2>
      <ul>
        <li>
          <strong>{site.name}:</strong> marca comercial registrada operada por{" "}
          {site.legalName}.
        </li>
        <li>
          <strong>Sitio:</strong> el sitio web {site.url} y todas sus
          subpáginas.
        </li>
        <li>
          <strong>Servicios:</strong> los productos y servicios de pagos,
          boletas electrónicas, recargas, pago de cuentas y demás
          funcionalidades operadas por {site.name} y, donde corresponda, por
          Sencillito®.
        </li>
        <li>
          <strong>Usuario / Comercio:</strong> persona natural o jurídica que
          accede al sitio o contrata los Servicios.
        </li>
      </ul>

      <h2>3. Uso del sitio</h2>
      <p>El sitio tiene finalidad informativa y comercial. Te comprometes a:</p>
      <ul>
        <li>Utilizar el sitio conforme a la ley y la buena fe.</li>
        <li>
          No realizar acciones que puedan dañar, sobrecargar o comprometer su
          funcionamiento.
        </li>
        <li>
          No intentar acceder a áreas restringidas ni eludir medidas de
          seguridad.
        </li>
      </ul>

      <h2>4. Información comercial y disponibilidad</h2>
      <p>
        Toda información publicada en el sitio (precios, equipos,
        funcionalidades, plazos) tiene carácter referencial. Los términos
        comerciales definitivos se establecen en el contrato o cotización
        específica que celebres con {site.legalName}.
      </p>
      <p>
        {site.legalName} se reserva el derecho de modificar, suspender o
        descontinuar cualquier producto o servicio en cualquier momento sin
        previo aviso, sin perjuicio de los compromisos vigentes con clientes
        contratados.
      </p>

      <h2>5. Propiedad intelectual</h2>
      <p>
        Todos los contenidos del sitio (textos, imágenes, gráficos, código,
        marcas, logotipos) son propiedad de {site.legalName} o de sus
        respectivos titulares y están protegidos por la legislación chilena
        sobre propiedad intelectual.
      </p>
      <p>
        Las marcas <strong>{site.name}</strong>, <strong>Punto Sencillito®</strong>{" "}
        y <strong>Sencillito®</strong> son marcas registradas. Su reproducción,
        distribución o uso sin autorización escrita está prohibido.
      </p>

      <h2>6. Enlaces a terceros</h2>
      <p>
        El sitio puede contener enlaces a servicios de terceros (por ejemplo,
        WhatsApp, redes sociales). {site.legalName} no es responsable del
        contenido, políticas o disponibilidad de dichos sitios externos.
      </p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>
        {site.legalName} se esfuerza por mantener la información del sitio
        precisa y actualizada, pero no garantiza la ausencia de errores,
        omisiones o interrupciones. En la máxima medida permitida por la ley
        chilena, {site.legalName} no será responsable por daños indirectos,
        lucro cesante o daños emergentes derivados del uso o imposibilidad de
        uso del sitio.
      </p>

      <h2>8. Protección de datos</h2>
      <p>
        El tratamiento de datos personales recolectados a través del sitio se
        rige por nuestra <a href="/privacidad">Política de Privacidad</a>, que
        forma parte integrante de estos Términos.
      </p>

      <h2>9. Modificaciones</h2>
      <p>
        {site.legalName} puede actualizar estos Términos en cualquier momento.
        La versión vigente será la publicada en esta misma página, con la fecha
        de actualización al inicio del documento. El uso continuado del sitio
        después de los cambios implica aceptación de la nueva versión.
      </p>

      <h2>10. Ley aplicable y jurisdicción</h2>
      <p>
        Estos Términos se rigen por las leyes de la República de Chile.
        Cualquier controversia derivada de su interpretación o cumplimiento
        será sometida a los Tribunales Ordinarios de Justicia con asiento en{" "}
        <strong>Villarrica, Región de La Araucanía</strong>, sin perjuicio de
        los mecanismos alternativos de resolución de conflictos que las partes
        puedan acordar.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Si tienes preguntas sobre estos Términos, escríbenos a{" "}
        <a href={`mailto:${site.emailLegal}`}>{site.emailLegal}</a>.
      </p>
    </LegalLayout>
  );
}

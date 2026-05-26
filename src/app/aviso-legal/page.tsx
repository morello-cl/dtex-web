import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { formattedMufinAddress, site } from "@/lib/site";

const LAST_UPDATED = "2026-05-25";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description:
    "Información corporativa de MUFIN SpA, operadora de DTEx® en Villarrica, Región de La Araucanía. RUT, contactos y marcas registradas.",
  alternates: { canonical: `${site.url}/aviso-legal` },
};

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="placeholder">{children}</span>
);

export default function AvisoLegalPage() {
  return (
    <LegalLayout
      title="Aviso Legal"
      lastUpdated={LAST_UPDATED}
      breadcrumb={{ name: "Aviso Legal", href: "/aviso-legal" }}
      intro="Información corporativa y datos de contacto del titular del sitio."
    >
      <div className="legal-note">
        <strong>Aviso:</strong> Plantilla base. Los datos entre{" "}
        <span className="placeholder">[CORCHETES]</span> deben ser completados
        por el equipo administrativo de {site.legalName}.
      </div>

      <h2>1. Titular del sitio</h2>
      <ul>
        <li>
          <strong>Razón social:</strong> {site.legalName}
        </li>
        <li>
          <strong>Nombre comercial:</strong> {site.name}
        </li>
        <li>
          <strong>RUT:</strong> {site.mufinRut}
        </li>
        <li>
          <strong>Giro:</strong>{" "}
          <Placeholder>[Giro registrado en SII]</Placeholder>
        </li>
        <li>
          <strong>Domicilio legal:</strong> {formattedMufinAddress()}
        </li>
        <li>
          <strong>Representante legal:</strong>{" "}
          <Placeholder>[Nombre completo]</Placeholder>,{" "}
          RUT <Placeholder>[RUT representante]</Placeholder>.
        </li>
      </ul>

      <h2>2. Contacto</h2>
      <ul>
        <li>
          <strong>WhatsApp comercial:</strong> +{site.whatsappNumber}
        </li>
        <li>
          <strong>Correo comercial DTEx®:</strong>{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        <li>
          <strong>Correo legal / contacto:</strong>{" "}
          <a href={`mailto:${site.emailLegal}`}>{site.emailLegal}</a>
        </li>
        <li>
          <strong>Correo MUFIN:</strong>{" "}
          <a href={`mailto:${site.emailMufin}`}>{site.emailMufin}</a>
        </li>
        <li>
          <strong>Sitio web:</strong>{" "}
          <a href={site.url}>{site.url}</a>
        </li>
      </ul>

      <h2>3. Marcas y propiedad intelectual</h2>
      <p>
        Las siguientes marcas son propiedad de sus respectivos titulares y se
        utilizan en este sitio bajo autorización o conforme a la normativa
        aplicable:
      </p>
      <ul>
        <li>
          <strong>DTEx®</strong> — marca registrada de {site.legalName}.
        </li>
        <li>
          <strong>Punto Sencillito®</strong> y <strong>Sencillito®</strong> —
          marcas registradas de su titular, utilizadas bajo acuerdo
          comercial. El servicio Punto Sencillito® es operado por Sencillito®.
        </li>
        <li>
          <strong>Kozen®</strong>, <strong>Sunmi®</strong> — marcas de los
          fabricantes de los equipos POS distribuidos por {site.name}.
        </li>
      </ul>

      <h2>4. Documentos relacionados</h2>
      <ul>
        <li>
          <a href="/privacidad">Política de Privacidad</a> — cómo tratamos tus
          datos personales.
        </li>
        <li>
          <a href="/terminos">Términos y Condiciones</a> — uso del sitio.
        </li>
        <li>
          <a href="/arriendo">Términos de Arriendo de Equipos</a> — condiciones
          de los equipos en modalidad de arriendo.
        </li>
      </ul>

      <h2>5. Inscripciones y registros</h2>
      <p>
        {site.legalName} es contribuyente registrado en el Servicio de
        Impuestos Internos de Chile y emisor autorizado de documentos
        tributarios electrónicos. Para detalles específicos sobre resoluciones
        y autorizaciones, escríbenos a{" "}
        <a href={`mailto:${site.emailLegal}`}>{site.emailLegal}</a>.
      </p>
    </LegalLayout>
  );
}

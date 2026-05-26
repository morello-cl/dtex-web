import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { site } from "@/lib/site";

const LAST_UPDATED = "2026-05-25";

export const metadata: Metadata = {
  title: "Términos de Arriendo de Equipos POS",
  description:
    "Condiciones de arriendo de equipos POS Android (Kozen P8 Neo, Sunmi P3, Sunmi D3 mini) para comercios chilenos. Plazos, depósito, mantención y devolución.",
  alternates: { canonical: `${site.url}/arriendo` },
};

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="placeholder">{children}</span>
);

export default function ArriendoPage() {
  return (
    <LegalLayout
      title="Términos de Arriendo de Equipos"
      lastUpdated={LAST_UPDATED}
      breadcrumb={{ name: "Términos de Arriendo", href: "/arriendo" }}
      intro="Condiciones aplicables al arriendo de equipos POS (Kozen P8 Neo, Sunmi P3, Sunmi D3 mini y similares) ofrecidos por DTEx®."
    >
      <div className="legal-note">
        <strong>Aviso:</strong> Plantilla base. Los valores específicos
        (plazos, montos, multas) los define el contrato comercial firmado
        entre el Comerciante y {site.legalName}. Esta página establece el marco
        general; el contrato individual prevalece en caso de conflicto.
      </div>

      <h2>1. Objeto</h2>
      <p>
        {site.legalName} (el <strong>Arrendador</strong>) entrega en arriendo
        al Comerciante uno o más equipos POS Android, junto con el software{" "}
        {site.name} y los servicios asociados de pagos, boletas y recargas.
      </p>
      <p>
        Los equipos disponibles bajo modalidad de arriendo incluyen:
      </p>
      <ul>
        <li>
          <strong>Kozen P8 Neo</strong> — disponible en venta o arriendo.
        </li>
        <li>
          <strong>Sunmi P3</strong> — disponible <strong>solo en arriendo</strong>,
          por su alto costo de adquisición.
        </li>
        <li>
          <strong>Sunmi D3 mini</strong> — disponible en venta o arriendo.
        </li>
      </ul>

      <h2>2. Plazo</h2>
      <p>
        El plazo mínimo de arriendo es de{" "}
        <Placeholder>[X meses]</Placeholder>, renovable automáticamente por
        períodos iguales salvo aviso de término con{" "}
        <Placeholder>[X días]</Placeholder> de anticipación.
      </p>

      <h2>3. Renta y forma de pago</h2>
      <ul>
        <li>
          <strong>Renta mensual:</strong>{" "}
          <Placeholder>[Monto CLP por modelo]</Placeholder>.
        </li>
        <li>
          <strong>Forma de pago:</strong>{" "}
          <Placeholder>[Transferencia / PAC / etc.]</Placeholder>, con
          vencimiento el día <Placeholder>[X]</Placeholder> de cada mes.
        </li>
        <li>
          <strong>Reajuste:</strong> la renta podrá reajustarse anualmente
          conforme a <Placeholder>[IPC u otro índice]</Placeholder>.
        </li>
      </ul>

      <h2>4. Depósito en garantía</h2>
      <p>
        Al inicio del arriendo el Comerciante entrega un depósito equivalente
        a <Placeholder>[X meses de renta]</Placeholder>, que será restituido al
        término del contrato previa devolución del equipo en buenas
        condiciones de uso.
      </p>

      <h2>5. Entrega e instalación</h2>
      <p>
        El Arrendador entrega el equipo configurado y operativo. La instalación
        puede ser realizada por personal técnico de {site.name} o, en algunos
        casos, ser autoinstalable. El Comerciante debe verificar el correcto
        funcionamiento al momento de la entrega.
      </p>

      <h2>6. Uso permitido</h2>
      <p>El equipo arrendado debe utilizarse únicamente para:</p>
      <ul>
        <li>Aceptar pagos con tarjeta.</li>
        <li>Emitir boletas y/o facturas electrónicas conforme al SII.</li>
        <li>Procesar recargas y pago de cuentas vía Sencillito®.</li>
        <li>Operaciones comerciales propias del Comerciante.</li>
      </ul>
      <p>
        Queda prohibido modificar el software, intervenir el hardware o
        utilizar el equipo para fines distintos de los autorizados.
      </p>

      <h2>7. Mantención y soporte</h2>
      <p>
        Durante la vigencia del arriendo, {site.name} provee:
      </p>
      <ul>
        <li>
          Actualizaciones de software y mantención del sistema operativo.
        </li>
        <li>
          Soporte técnico remoto en horario hábil{" "}
          (<Placeholder>[lun-vie 9:00-18:00]</Placeholder>).
        </li>
        <li>
          Reemplazo del equipo en caso de falla de fábrica, dentro de los
          plazos definidos en el contrato.
        </li>
      </ul>

      <h2>8. Pérdida, daño o mal uso</h2>
      <p>
        El Comerciante es responsable del cuidado del equipo. En caso de
        pérdida, robo o daño por mal uso, deberá pagar el{" "}
        <strong>valor de reposición</strong> del equipo, según se establezca en
        el contrato individual (referencia:{" "}
        <Placeholder>[Valor reposición por modelo]</Placeholder>).
      </p>

      <h2>9. Devolución</h2>
      <p>
        Al término del arriendo, el equipo debe ser devuelto en su empaque
        original (si existe) y en condiciones operativas normales, sin daños
        atribuibles a mal uso. El Arrendador verificará el estado y, dentro de{" "}
        <Placeholder>[X días hábiles]</Placeholder>, restituirá el depósito
        descontando, si corresponde, daños o cargos pendientes.
      </p>

      <h2>10. Término anticipado</h2>
      <p>El arriendo podrá terminarse anticipadamente en los siguientes casos:</p>
      <ul>
        <li>
          <strong>Por el Comerciante:</strong> avisando con{" "}
          <Placeholder>[X días]</Placeholder> de anticipación. Puede aplicarse
          una multa equivalente a{" "}
          <Placeholder>[X meses de renta]</Placeholder> si el término ocurre
          antes del plazo mínimo.
        </li>
        <li>
          <strong>Por el Arrendador:</strong> en caso de incumplimiento grave
          (mora en el pago, mal uso del equipo, uso ilícito).
        </li>
      </ul>

      <h2>11. Privacidad y datos</h2>
      <p>
        Los datos personales tratados con motivo del arriendo se rigen por la{" "}
        <a href="/privacidad">Política de Privacidad</a>.
      </p>

      <h2>12. Ley aplicable y jurisdicción</h2>
      <p>
        Este arriendo se rige por las leyes chilenas. Para cualquier
        controversia, las partes se someten a los Tribunales Ordinarios de
        Justicia con asiento en{" "}
        <strong>Villarrica, Región de La Araucanía</strong>.
      </p>

      <h2>13. Contacto</h2>
      <p>
        Para consultas comerciales de arriendo, contáctanos por WhatsApp al{" "}
        <strong>+{site.whatsappNumber}</strong> o por correo a{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. Para consultas
        contractuales o legales, escríbenos a{" "}
        <a href={`mailto:${site.emailLegal}`}>{site.emailLegal}</a>.
      </p>
    </LegalLayout>
  );
}

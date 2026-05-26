import { site } from "@/lib/site";

// JSON-LD structured data: ayuda a Google a renderizar el knowledge panel
// con logo, redes y datos comerciales. Se inyecta como <script> al final
// del body — no afecta render ni hydratación.

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: site.mufinAddress.streetAddress,
  addressLocality: site.mufinAddress.addressLocality,
  addressRegion: site.mufinAddress.addressRegion,
  addressCountry: site.mufinAddress.addressCountry,
};

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: `${site.url}/dtex-icon.png`,
  description: site.description,
  address: POSTAL_ADDRESS,
  sameAs: [site.social.instagram, site.social.facebook],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: `+${site.whatsappNumber}`,
      email: site.email,
      areaServed: "CL",
      availableLanguage: ["es"],
    },
    {
      "@type": "ContactPoint",
      contactType: "legal",
      email: site.emailLegal,
      areaServed: "CL",
      availableLanguage: ["es"],
    },
  ],
};

// LocalBusiness con dirección real de la sede en Villarrica. Quedan como
// pendientes (TODO) las openingHoursSpecification y geo cuando se confirmen.
const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${site.url}/#localbusiness`,
  name: site.name,
  url: site.url,
  image: `${site.url}/opengraph-image.jpg`,
  logo: `${site.url}/dtex-icon.png`,
  telephone: `+${site.whatsappNumber}`,
  email: site.email,
  priceRange: "$$",
  address: POSTAL_ADDRESS,
  areaServed: { "@type": "Country", name: "Chile" },
  // TODO: confirmar horario de atención y coordenadas geográficas.
  // openingHoursSpecification: [
  //   {
  //     "@type": "OpeningHoursSpecification",
  //     dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  //     opens: "09:00",
  //     closes: "18:00",
  //   },
  // ],
  // geo: { "@type": "GeoCoordinates", latitude: -39.286, longitude: -72.227 },
  parentOrganization: { "@id": `${site.url}/#organization` },
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: site.name,
  inLanguage: "es-CL",
  publisher: { "@id": `${site.url}/#organization` },
};

export default function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [ORGANIZATION, LOCAL_BUSINESS, WEBSITE],
  };
  return (
    <script
      type="application/ld+json"
      // Stringify sin escapes raros; Next no inyecta nada peligroso aquí.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

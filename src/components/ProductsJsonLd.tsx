import { EQUIPOS, type Equipo } from "@/data/equipos";
import { site } from "@/lib/site";

// GoodRelations BusinessFunction URIs (estándar para indicar si el producto
// se vende, arrienda, etc. junto con schema.org).
const BF_SELL = "http://purl.org/goodrelations/v1#Sell";
const BF_LEASE_OUT = "http://purl.org/goodrelations/v1#LeaseOut";

function offersFor(equipo: Equipo) {
  const seller = { "@id": `${site.url}/#organization` };
  const baseOffer = {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    seller,
    areaServed: { "@type": "Country", name: "Chile" },
  };

  if (equipo.availability === "rent-only") {
    return [{ ...baseOffer, businessFunction: BF_LEASE_OUT }];
  }
  // sale-or-rent: dos ofertas.
  return [
    { ...baseOffer, businessFunction: BF_SELL },
    { ...baseOffer, businessFunction: BF_LEASE_OUT },
  ];
}

function productJsonLd(equipo: Equipo) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site.url}/#equipo-${equipo.id}`,
    name: equipo.model,
    description: equipo.description,
    brand: { "@type": "Brand", name: equipo.brand },
    model: equipo.model,
    category: "Terminal de pago POS Android",
    image: `${site.url}/opengraph-image.jpg`,
    offers: offersFor(equipo),
  };
}

// JSON-LD Product por cada equipo del catálogo. Permite que Google entienda
// el catálogo y, eventualmente, muestre rich snippets para búsquedas tipo
// "Kozen P8 Neo Chile" o "arriendo POS Sunmi". Sin precio publicado los
// rich snippets de precio no se activan, pero la marca/modelo/dispobilidad
// sí ayudan al graph del comercio.
export default function ProductsJsonLd() {
  return (
    <>
      {EQUIPOS.map((eq) => (
        <script
          key={eq.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd(eq)),
          }}
        />
      ))}
    </>
  );
}

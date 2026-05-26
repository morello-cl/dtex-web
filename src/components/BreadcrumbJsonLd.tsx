import { site } from "@/lib/site";

type Crumb = { name: string; href: string };

type Props = {
  /** Cadena de migas SIN incluir "Inicio" — se añade automáticamente al principio. */
  trail: Crumb[];
};

// JSON-LD BreadcrumbList: permite que Google muestre la ruta de navegación
// como rich snippet en los resultados de búsqueda en vez de la URL cruda.
export default function BreadcrumbJsonLd({ trail }: Props) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
    ...trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: c.name,
      item: `${site.url}${c.href}`,
    })),
  ];
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

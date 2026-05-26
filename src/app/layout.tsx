import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    // <60 chars para que no se corte en SERPs. El tagline completo va en
    // openGraph.title más abajo donde no hay límite estricto.
    default: `${site.name} — POS, boletas y servicios para tu comercio`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "POS Android Chile",
    "Pago con tarjeta comercio",
    "Punto Sencillito",
    "Boleta electrónica SII",
    "Factura electrónica Chile",
    "Pago de cuentas comercio",
    "Recargas electrónicas",
    "Equipo POS Kozen",
    "Equipo POS Sunmi",
    "Arriendo POS Chile",
    "POS para almacén",
    "POS para minimarket",
    "POS para botillería",
    "Comercios Chile",
    "POS Villarrica",
    "POS Araucanía",
    "DTEx",
    "MUFIN",
    "Sencillito",
  ],
  authors: [{ name: site.legalName }],
  alternates: {
    canonical: site.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d2e72",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

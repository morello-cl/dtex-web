import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ProductsJsonLd from "@/components/ProductsJsonLd";
import FaqJsonLd from "@/components/FaqJsonLd";
import Hero from "@/components/sections/Hero";
import Beneficios from "@/components/sections/Beneficios";
import Sencillito from "@/components/sections/Sencillito";
import Redes from "@/components/sections/Redes";
import Equipos from "@/components/sections/Equipos";
import Portal from "@/components/sections/Portal";
import CtaFinal from "@/components/sections/CtaFinal";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <ProductsJsonLd />
      <FaqJsonLd />
      <Navbar />
      <main className="flex-1">
        {/* Orden por prioridad comercial: primero lo que se vende hoy
            (Equipos, Sencillito), luego el Portal de pagos que viene con el
            servicio, y al final lo que está en certificación (Redes). */}
        <Hero />
        <Beneficios />
        <Equipos />
        <Sencillito />
        <Portal />
        <Redes />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

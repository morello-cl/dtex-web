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
import Casos from "@/components/sections/Casos";
import Clientes from "@/components/sections/Clientes";
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
            (Equipos, Sencillito), luego la prueba social, y al final lo que
            todavía está en certificación (las redes de pago). */}
        <Hero />
        <Beneficios />
        <Equipos />
        <Sencillito />
        <Casos />
        <Clientes />
        <Redes />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ProductsJsonLd from "@/components/ProductsJsonLd";
import FaqJsonLd from "@/components/FaqJsonLd";
import Hero from "@/components/sections/Hero";
import Beneficios from "@/components/sections/Beneficios";
import Sencillito from "@/components/sections/Sencillito";
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
        <Hero />
        <Beneficios />
        <Sencillito />
        <Equipos />
        <Casos />
        <Clientes />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

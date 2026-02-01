import { Link } from "react-router-dom";

export default function PromoBanner() {
  return (
    <section className="bg-primary text-white py-12">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            FIN DE TEMPORADA
          </h2>
          <p className="text-xl opacity-90 font-medium">
            Hasta 40% de descuento en artículos seleccionados.
          </p>
        </div>

        <Link
          to="/productos"
          className="bg-white text-primary px-10 py-4 rounded-lg font-black uppercase tracking-widest hover:scale-105 transition-transform inline-block"
        >
          Comprar ahora
        </Link>
      </div>
    </section>
  );
}

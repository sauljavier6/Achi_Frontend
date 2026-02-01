import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[90vh] flex items-end">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.3), rgba(0,0,0,.8)), url('/hero-valentto.png')",
          }}
        />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pb-20 w-full">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block bg-primary text-white text-xs font-black px-3 py-1 uppercase tracking-widest rounded">
              Nueva Temporada
            </span>

            <h1 className="text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter italic">
              Define tu estilo
            </h1>

            <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-xl">
              Estilo que impone tendencia. Descubre nuestra nueva colección y
              redefine tu guardarropa con prendas que hablan por ti.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/productos"
                className="bg-primary text-white px-8 py-4 rounded-lg font-bold uppercase"
              >
                Comprar Ahora
              </Link>
              <Link
                to="/productos"
                className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase"
              >
                Ver Colección
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

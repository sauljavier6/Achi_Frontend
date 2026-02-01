export default function Hero() {
  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[90vh] flex items-end">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.7)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfBSAh_0y6XxA2i1Dc3bE69PXEfOMQXWX2W5pr_G3XGJQOkBPbQbZRa3qoC4Kl_AgF4EGUfLuJDcpCLzZ40rs89XmcYPrk0tv5QMjLJayARxs-dNk-R1vh4B0VNwiZyAy6GhJpW8xdWZSkiY-NO12_8EaTWqtcL-lRPcETqpbU1x88jBtsYInOcIAiUvqsUB6W0uUMMKb4vEkG9FB6Es3kxnaQk_r2lUETfSHmxydoxnVamDHif0aqhtaLBRPawc9Kl-H1l5Xu7XE')",
          }}
        />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pb-20 w-full">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block bg-primary text-white text-xs font-black px-3 py-1 uppercase tracking-widest rounded">
              Nueva Temporada
            </span>

            <h1 className="text-white text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter italic">
              ULTRA-PERFORMANCE GEAR
            </h1>

            <p className="text-white/80 text-lg md:text-xl max-w-xl">
              Supera tus límites con la nueva tecnología de amortiguación.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-primary text-white px-8 py-4 rounded-lg font-bold uppercase">
                Comprar Ahora
              </button>
              <button className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase">
                Ver Colección
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

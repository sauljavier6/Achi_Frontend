const WePage = () => {
  return (
    <section className="mx-auto my-10 max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
        <header className="relative overflow-hidden bg-primary px-7 py-12 text-white sm:px-12 sm:py-16">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-secondary/30" />
          <div className="relative max-w-2xl">
            <p className="font-bold uppercase tracking-[0.22em] text-primary-fixed">Desde Guadalajara</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Nuestra historia</h1>
            <p className="mt-5 text-lg leading-8 text-white/85">
              Una tienda creada para celebrar el cariño, la compañía y la lealtad que las mascotas
              nos entregan todos los días.
            </p>
          </div>
        </header>

        <div className="p-7 sm:p-12">
          <div className="space-y-5 text-base leading-8 text-on-surface-variant sm:text-lg">
            <p>
              Hachi nació en Guadalajara con una idea sencilla: hacer más fácil encontrar productos
              útiles, seguros y bonitos para quienes forman parte de la familia.
            </p>
            <p>
              Somos una tienda creada por amantes de los animales. Seleccionamos accesorios,
              artículos de paseo, higiene, descanso, entretenimiento y bienestar pensando en las
              necesidades reales de perros, gatos y sus personas.
            </p>
            <p>
              Nuestro nombre está inspirado en la lealtad y el cariño incondicional que las mascotas
              nos entregan. Por eso buscamos corresponderles con productos que mejoren su rutina y
              con una atención cercana, honesta y responsable.
            </p>
            <p>
              Desde Guadalajara queremos acompañarte en cada etapa: la llegada de un nuevo compañero,
              su primer paseo, sus juegos favoritos y todos esos pequeños momentos que terminan
              convirtiéndose en grandes recuerdos.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl bg-primary-fixed p-6">
              <span className="text-2xl">🐾</span>
              <h2 className="mt-3 font-bold text-primary">Elegimos con cariño</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Productos pensados para su comodidad, seguridad y diversión.</p>
            </article>
            <article className="rounded-2xl bg-secondary-container p-6">
              <span className="text-2xl">🏡</span>
              <h2 className="mt-3 font-bold text-secondary">Cerca de tu familia</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Una experiencia de compra clara, cercana y confiable.</p>
            </article>
            <article className="rounded-2xl bg-tertiary-fixed p-6">
              <span className="text-2xl">💛</span>
              <h2 className="mt-3 font-bold text-tertiary">Momentos que importan</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Acompañamos las pequeñas historias que construyen grandes recuerdos.</p>
            </article>
          </div>

          <blockquote className="mt-10 rounded-2xl border-l-4 border-primary bg-surface-container-low p-6 text-center text-xl font-bold text-primary sm:text-2xl">
            Hachi Veterinaria: cuidamos a quienes hacen de tu casa un hogar.
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default WePage;

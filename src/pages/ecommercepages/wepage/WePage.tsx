const WePage = () => {
  return (
    <section className="mx-auto my-10 max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-7 shadow-sm sm:p-10">
        <p className="font-bold uppercase tracking-widest text-secondary">Conócenos</p>
        <h1 className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">Achi Veterinaria</h1>
        <p className="mt-5 text-lg leading-8 text-on-surface-variant">
          Somos una veterinaria y tienda para mascotas en Tijuana. Ayudamos a las familias a cuidar
          a sus compañeros con atención cercana, orientación responsable y productos seleccionados.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl bg-primary-fixed p-6">
            <h2 className="text-xl font-bold text-primary">Nuestra misión</h2>
            <p className="mt-2 leading-7 text-on-surface-variant">
              Acompañar el bienestar de cada mascota con un servicio humano, claro y profesional.
            </p>
          </article>
          <article className="rounded-2xl bg-secondary-container p-6">
            <h2 className="text-xl font-bold text-secondary">Nuestro compromiso</h2>
            <p className="mt-2 leading-7 text-on-surface-variant">
              Recomendar únicamente lo que cada mascota necesita y mantener una compra segura.
            </p>
          </article>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-on-surface">Lo que nos distingue</h2>
          <ul className="mt-4 grid gap-3 text-on-surface-variant sm:grid-cols-2">
            <li className="rounded-xl bg-surface-container-low p-4">Atención personalizada</li>
            <li className="rounded-xl bg-surface-container-low p-4">Productos seleccionados</li>
            <li className="rounded-xl bg-surface-container-low p-4">Compra y pago seguros</li>
            <li className="rounded-xl bg-surface-container-low p-4">Acompañamiento responsable</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WePage;

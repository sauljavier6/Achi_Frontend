export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-primary text-white">
      <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3 md:px-10 xl:px-16">
        <div className="text-center md:text-left">
          <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <img
                alt="Patas y Pasteles"
                className="h-7 w-7 brightness-0 invert"
                src="/medicare.png"
              />
            </div>

            <span className="text-xl font-extrabold">Patas y Pasteles</span>
          </div>

          <p className="mx-auto max-w-sm text-sm leading-relaxed text-white/70 md:mx-0">
            Accesorios, productos y detalles especiales para consentir a tus
            mascotas con estilo, comodidad y mucho cariño.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/90">
            Enlaces
          </h4>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <a className="text-white/70 transition hover:text-white" href="#">
              Privacidad
            </a>
            <a className="text-white/70 transition hover:text-white" href="#">
              Términos
            </a>
            <a className="text-white/70 transition hover:text-white" href="#">
              Productos
            </a>
            <a className="text-white/70 transition hover:text-white" href="#">
              Contacto
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center text-center md:items-end md:text-right">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/90">
            Atención
          </h4>

          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Cuidamos cada detalle para que tus mascotas disfruten productos
            seguros, cómodos y con diseño.
          </p>

          <p className="mt-6 text-xs text-white/50">
            © 2026 Patas y Pasteles. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
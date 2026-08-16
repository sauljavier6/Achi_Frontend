export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-primary text-white">
      <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3 md:px-10 xl:px-16">
        <div className="text-center md:text-left">
          <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white">
              <img alt="Achi Veterinaria" className="h-full w-full object-cover" src="/logo.png" />
            </div>
            <span className="text-xl font-extrabold">Achi Veterinaria</span>
          </div>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-white/70 md:mx-0">
            Atención veterinaria y productos seleccionados para cuidar a tus mascotas con responsabilidad y cariño.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/90">Enlaces</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <a className="text-white/70 transition hover:text-white" href="#">Privacidad</a>
            <a className="text-white/70 transition hover:text-white" href="#">Términos</a>
            <a className="text-white/70 transition hover:text-white" href="/productos">Productos</a>
            <a className="text-white/70 transition hover:text-white" href="/nosotros">Nosotros</a>
          </div>
        </div>

        <div className="flex flex-col items-center text-center md:items-end md:text-right">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/90">Atención</h4>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Cuidamos cada detalle para ofrecer una experiencia clara, cercana y segura.
          </p>
          <p className="mt-6 text-xs text-white/50">© 2026 Achi Veterinaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

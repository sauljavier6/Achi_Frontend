export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-white/5 py-20 px-6 lg:px-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">

        {/* Brand */}
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-primary size-6">
              <svg fill="none" viewBox="0 0 48 48">
                <path
                  d="M42.1739 20.1739L27.8261 5.82609..."
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-lg font-black uppercase tracking-tighter italic">
              valentto mx
            </h2>
          </div>

          <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-8">
            Elevando el potencial humano a través del estilo y la innovación.
          </p>

          <div className="flex gap-4">
            <a className="size-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-base">share</span>
            </a>
          </div>
        </div>

        {/* Columnas */}
        <FooterCol
          title="Explorar"
          links={[
            "Localizador de Tiendas",
            "Sport Store Membership",
            "Tarjetas de Regalo",
            "Feedback",
          ]}
        />

        <FooterCol
          title="Ayuda"
          links={[
            "Estado del pedido",
            "Envíos y entregas",
            "Devoluciones",
            "Opciones de pago",
          ]}
        />

      </div>

      {/* Bottom */}
      <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-gray-400">
        <span>© 2026 valentto mx, Inc. Todos los derechos reservados</span>
        <div className="flex gap-8">
          <a className="hover:text-black dark:hover:text-white">Guías</a>
          <a className="hover:text-black dark:hover:text-white">
            Términos de Uso
          </a>
          <a className="hover:text-black dark:hover:text-white">
            Política de Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h4 className="font-black uppercase tracking-widest text-sm mb-6">
        {title}
      </h4>
      <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
        {links.map((l) => (
          <li key={l}>
            <a className="hover:text-primary transition-colors" href="#">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

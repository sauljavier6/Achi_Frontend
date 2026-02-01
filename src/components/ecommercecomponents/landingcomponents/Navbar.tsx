function Navbar() {
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-solid border-[#f3e7e8] dark:border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        <div className="flex items-center gap-4">
          <div className="text-primary size-8">
            <svg fill="none" viewBox="0 0 48 48">
              <path
                d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter">
            Cristian Store
          </h2>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          <a className="text-sm font-bold uppercase hover:text-primary">
            Hombre
          </a>
          <a className="text-sm font-bold uppercase hover:text-primary">
            Mujer
          </a>
          <a className="text-sm font-bold uppercase hover:text-primary">
            Niños
          </a>
          <a className="text-sm font-bold uppercase text-primary">Ofertas</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-[#f3e7e8] dark:bg-white/5 rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-sm">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-32 placeholder:text-[#9a4c52]"
              placeholder="Buscar"
            />
          </div>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
            <span className="material-symbols-outlined">favorite</span>
          </button>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full relative">
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full">
              2
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

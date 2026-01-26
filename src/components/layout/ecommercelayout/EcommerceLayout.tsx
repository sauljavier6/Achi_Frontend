import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./EcomerceLayout.module.scss";
import { useEffect, useRef, useState } from "react";
import { getProductsByDescription } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { Link } from "react-router-dom";

interface ProductProps {
  ID_Product: number;
  Description: string;
}

const EcommerceLayout = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutside = (event: { target: any; }) => {
      if (
        containerRef.current &&
        containerRef.current instanceof HTMLDivElement &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchProducts = async (term: string) => {
    if (!term) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getProductsByDescription(term);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>     
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-3 py-2 lg:px-5 lg:pl-3 bg-blue-800 flex justify-between items-center">
        <ul className="hidden sm:flex" role="none">
          <li>
            <a href="/nosotros" className={styles.menuitem} role="menuitem">Nosotros</a>
          </li>
          <li>
            <a href="#" className={styles.menuitem} role="menuitem">Facturación</a>
          </li>
        </ul>

        <ul className="flex gap-x-2" role="none">
          <li>
            <a href="#" className={styles.menuitem}>
              <img src="/icons/llamar.png" alt="telefono" className="w-6 h-auto filter invert" />
            </a>
          </li>
          <li>
            <a href="#" className={styles.menuitem}>
              <img src="/icons/facebook.png" alt="facebook" className="w-6 h-auto filter invert" />
            </a>
          </li>
          <li>
            <a href="#" className={styles.menuitem}>
              <img src="/icons/instagram.png" alt="instagram" className="w-6 h-auto filter invert" />
            </a>
          </li>
          <li>
            <a href="#" className={styles.menuitem}>
              <img src="/icons/whatsapp.png" alt="whatsapp" className="w-6 h-auto filter invert" />
            </a>
          </li>
        </ul>
      </div>

      <div className="px-3 py-3 lg:px-5 lg:pl-3 flex items-center justify-between">
        <div className="flex items-center justify-between w-1/2">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/medicare.png" className="h-8 w-auto rounded" alt="Logo" />
            <span className="hidden sm:inline text-xl font-semibold text-gray-800 dark:text-white whitespace-nowrap">
              MEDICARE TJ
            </span>
          </Link>
          <ul className="hidden sm:flex gap-6 text-gray-800 dark:text-white font-medium text-lg">
            <li className="hover:text-blue-600 transition-colors">
              <a href="/" className={styles.linkreset}>Inicio</a>
            </li>
            <li className="hover:text-blue-600 transition-colors">
              <a href="/productos" className={styles.linkreset}>Productos</a>
            </li>
            <li className="hover:text-blue-600 transition-colors">
              <a href="/cotizaciones" className={styles.linkreset}>Cotizaciones</a>
            </li>
          </ul>
        </div>
      
        <button
          className="sm:hidden text-blue-800 focus:outline-none"
          onClick={() => { setMenuOpen(!isMenuOpen); }}>
          <img src="/icons/menu.png" alt="menu" className="w-6 h-6" />
        </button>

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {isMenuOpen && (
          <div
            className="sm:hidden fixed top-[110px] left-0 w-full bg-white border-t shadow-md z-50 transition-transform transform duration-300"
          >
            <ul className="flex flex-col gap-4 p-4">
              <li>
                <a href="/" className={styles.linkreset} onClick={() => setMenuOpen(false)}>Inicio</a>
              </li>
              <li>
                <a href="/productos" className={styles.linkreset} onClick={() => setMenuOpen(false)}>Productos</a>
              </li>
              <li>
                <a href="/cotizaciones" className={styles.linkreset} onClick={() => setMenuOpen(false)}>Cotizaciones</a>
              </li>
              <li>
                <a href="/nosotros" className={styles.linkreset} onClick={() => setMenuOpen(false)}>Nosotros</a>
              </li>
              <li>
                <a href="/facturacion" className={styles.linkreset} onClick={() => setMenuOpen(false)}>Facturación</a>
              </li>
            </ul>

            <div ref={containerRef} className="relative flex items-center px-4 mb-4">
              <div
                className={`w-full transition-all duration-300 ease-in-out transform ${
                  isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                />
                {results.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {results.map((item) => (
                      <li
                        key={item.ID_Product}
                        onClick={() => {
                          navigate(`/detalles/${item.ID_Product}`);
                          setIsOpen(false);
                          setQuery("");
                          setMenuOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {item.Description}
                      </li>
                    ))}
                  </ul>
                )}
                {loading && <p className="text-gray-500 mt-1">Buscando...</p>}
              </div>
              {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="focus:outline-none absolute left-4 top-2">
                  <img src="/icons/lupa.png" alt="lupa" className="w-6 h-6" />
                </button>
              )}
            </div>

            <div className="px-4 mb-4">
              <a href="/carrito" className={styles.linkreset}>
                <img src="/icons/carrito-de-compras.png" alt="carrito" className="w-6 h-6" />
              </a>
            </div>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-6 mr-4">
          <div ref={containerRef} className="relative flex items-center">
            <div
              className={`absolute right-full mr-2 w-64 transition-all duration-300 ease-in-out transform ${
                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
            <input
              type="text"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
            {results.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {results.map((item) => (
                  <li
                    key={item.ID_Product}
                    onClick={() => {
                      navigate(`/detalles/${item.ID_Product}`);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {item.Description}
                  </li>
                ))}
              </ul>
            )}

            {loading && <p className="text-gray-500 mt-1">Buscando...</p>}
            </div>
            {!isOpen && (
              <button
                onClick={() => setIsOpen(true)}
                className="focus:outline-none"
              >
                <img
                  src="/icons/lupa.png"
                  alt="lupa"
                  className="w-6 h-6"
                />
              </button>
            )}
          </div>
          <a href="/carrito" className={styles.linkreset}><img src="/icons/carrito-de-compras.png" alt="carrito" className="w-6 h-6" /></a>
        </div>
      </div>
    </nav>

      <div className="pt-[100px] w-full">
        <Outlet />
      </div>
      <footer className="bg-blue-800 text-white">
        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Logo */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img
              src="/medicare.png"
              alt="Medicare"
              className="w-40 h-20 rounded-[40px] mb-4"
            />
            <p className="text-sm text-blue-100">
              Atención médica de calidad y confianza.
            </p>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nuestra Ubicación</h3>
            <div className="text-sm space-y-2 text-blue-100">
              <p>
                <span className="font-semibold text-white">Dirección:</span><br />
                Torre Reforma, Paseo de la Reforma 483, Cuauhtémoc, 06500 CDMX
              </p>
              <p>
                <span className="font-semibold text-white">Teléfono:</span><br />
                +52 55 1234 5678
              </p>
              <p>
                <span className="font-semibold text-white">Correo:</span><br />
                <a
                  href="mailto:contacto@medicare.mx"
                  className="underline hover:text-blue-300"
                >
                  contacto@medicare.mx
                </a>
              </p>
            </div>
          </div>

          {/* Mapa */}
          <div className="w-full h-48 rounded-lg overflow-hidden shadow-lg">
            <iframe
              title="Mapa de ubicación"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.451355688957!2d-99.16318468468205!3d19.39299378689979!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff49c4b3f7b7%3A0xdea44d2e56f11398!2sTorre%20Reforma!5e0!3m2!1ses!2smx!4v1615580387286!5m2!1ses!2smx"
              loading="lazy"
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>

        {/* Barra inferior */}
        <div className="bg-blue-900 text-center py-4 text-sm text-blue-100">
          <p>© 2025 Medicare. Todos los derechos reservados.</p>
          <p>
            Powered by <span className="font-semibold text-white">SWS Souls Web Solutions</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EcommerceLayout;
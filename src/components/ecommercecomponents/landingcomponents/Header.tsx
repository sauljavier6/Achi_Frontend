import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProductsByDescription } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useCart } from "../../../context/CartContext";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Header() {
  const [open, setOpen] = useState(false);
  const {
    state: { items },
  } = useCart();

  // 🔎 Buscador
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navItems = [
    { id: 1, label: "Hombre" },
    { id: 2, label: "Mujer" },
    { id: 3, label: "Niños" },
    { id: 4, label: "Niñas" },
  ];

  const navigate = useNavigate();

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

  const socials = [
    { icon: FaWhatsapp, url: "https://wa.me/526634032690", color: "text-green-500" },
    { icon: FaFacebook, url: "https://www.facebook.com/people/Valentto-MX/61583725322560/?mibextid=wwXIfr&rdid=RrX9sfhPDsBAVSS4&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AapeVXTto%2F%3Fmibextid%3DwwXIfr", color: "text-blue-600" },
    { icon: FaInstagram, url: "https://www.instagram.com/valenttomx?igsh=bGZ6YTYycXNidzNm&utm_source=qr", color: "text-pink-500" },
    { icon: FaTiktok, url: "https://www.tiktok.com/@valenttomx?_r=1&_t=ZS-93XTe6TzOT7", color: "text-black dark:text-white" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#f3e7e8] dark:border-white/10">
      <div className="mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-4 cursor-pointer"
        >
          <div className="text-primary size-8">
            <svg fill="none" viewBox="0 0 48 48">
              <path
                d="M42.1739 20.1739L27.8261 5.82609..."
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter">
            Sport Store
          </h2>
        </div>

        {/* Botón móvil */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-full hover:bg-gray-100"
        >
          <span className="material-symbols-outlined">
            {open ? "close" : "menu"}
          </span>
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={`/productos/${item.label}`}
              className={`text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors ${
                item.label === "Niñas" ? "text-primary" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* 🔎 Buscador fijo */}
          <div className="relative hidden lg:flex items-center">
            <input
              type="text"
              placeholder="Buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48 px-4 py-2 rounded-full bg-[#f3e7e8] dark:bg-white/5 text-sm focus:outline-none"
            />

            {results.length > 0 && (
              <ul className="absolute top-12 z-50 w-64 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {results.map((item) => (
                  <li
                    key={item.ID_Product}
                    onClick={() => {
                      navigate(`/detalles/${item.ID_Product}`);
                      setQuery("");
                    }}
                    className="px-3 py-2 hover:bg-primary/10 cursor-pointer"
                  >
                    {item.Description}
                  </li>
                ))}
              </ul>
            )}

            {loading && (
              <p className="absolute top-12 text-xs text-gray-500 mt-1">
                Buscando...
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {socials.map((s, i) => (
              <button
                key={i}
                onClick={() => window.open(s.url, "_blank")}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full ${s.color}`}
              >
                <s.icon className="text-2xl" />
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/carrito")}
            className="p-2 top-0.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full relative"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="absolute top-2 right-1 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full">
              {items.length}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-[999]">
          {/* Overlay oscuro */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-0 right-0 w-3/4 max-w-xs h-full bg-background-dark text-white flex flex-col p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <span className="text-lg font-bold">Menú</span>
              <button onClick={() => setOpen(false)} className="text-2xl">
                ✕
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-6 text-lg font-bold uppercase">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/productos/${item.label}`}
                  onClick={() => setOpen(false)}
                  className="hover:text-primary transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

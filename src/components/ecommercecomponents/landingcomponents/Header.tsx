import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";

import { getProductsByDescription } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useCart } from "../../../context/CartContext";

interface ImagenProduct {
  ID_ImagenProduct: number;
  ID_Product: number;
  Imagen: string;
}

export interface Product {
  ID_Product: number;
  Description: string;
  Code: string;
  Codesat: string;
  ID_Category: number;
  ID_Iva: number;
  State: boolean;
  ImagenProduct: ImagenProduct[];
  Price?: number;
}

export default function Header() {
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  const navigate = useNavigate();

  const {
    state: { items },
  } = useCart();

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    try {
      const data = await getProductsByDescription(term);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProduct = (id: number) => {
    navigate(`/detalles/${id}`);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-primary shadow-lg">
      <div className="page-container flex h-16 items-center justify-between md:h-20">
        <button
          onClick={() => {
            navigate("/");
            setOpen(false);
          }}
          className="text-left text-lg font-bold text-white md:text-2xl"
        >
          Paws & Pastels
        </button>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/productos"
            className="text-white transition-opacity duration-200 hover:opacity-80"
          >
            Ver todo
          </NavLink>

          <NavLink
            to="/productos?mascota=perros"
            className="text-white transition-opacity duration-200 hover:opacity-80"
          >
            Perros
          </NavLink>

          <NavLink
            to="/productos?mascota=gatos"
            className="text-white transition-opacity duration-200 hover:opacity-80"
          >
            Gatos
          </NavLink>

          <NavLink
            to="/productos?mascota=aves"
            className="text-white transition-opacity duration-200 hover:opacity-80"
          >
            Aves
          </NavLink>
        </div>

        <div
          ref={searchRef}
          className="relative hidden items-center rounded-full border border-white/30 bg-white/20 px-4 py-2 lg:flex"
        >
          <FaSearch className="shrink-0 text-white" size={18} />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 border-none bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/60"
            placeholder="Buscar productos..."
            type="text"
          />

          {results.length > 0 && (
            <ul className="absolute left-0 top-[120%] z-50 max-h-80 w-[360px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
              {results.map((item) => (
                <li
                  key={item.ID_Product}
                  onClick={() => goToProduct(item.ID_Product)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors hover:bg-gray-100"
                >
                  <img
                    src={
                      item.ImagenProduct?.[0]?.Imagen
                        ? `${import.meta.env.VITE_API_URL_IMAGES}${
                            item.ImagenProduct[0].Imagen
                          }`
                        : "/no-image.png"
                    }
                    alt={item.Description}
                    className="h-12 w-12 shrink-0 rounded-lg border object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-1 font-semibold text-gray-800">
                      {item.Description}
                    </span>

                    {item.Price && (
                      <span className="text-xs font-medium text-gray-500">
                        ${item.Price}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              navigate("/carrito");
              setOpen(false);
            }}
            className="relative transition-transform active:scale-95"
          >
            <FaShoppingCart className="text-white" size={22} />

            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full p-2 text-xl font-bold text-white transition hover:bg-white/10 md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 top-full w-full border-t border-white/10 bg-primary shadow-2xl md:hidden">
          <div
            ref={mobileSearchRef}
            className="relative border-b border-white/10 p-4"
          >
            <div className="flex items-center rounded-full bg-white/15 px-4 py-3">
              <FaSearch className="text-white" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="ml-3 flex-1 bg-transparent text-white outline-none placeholder:text-white/60"
              />
            </div>

            {results.length > 0 && (
              <ul className="mt-3 max-h-72 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl">
                {results.map((item) => (
                  <li
                    key={item.ID_Product}
                    onClick={() => goToProduct(item.ID_Product)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-gray-100"
                  >
                    <img
                      src={
                        item.ImagenProduct?.[0]?.Imagen
                          ? `${import.meta.env.VITE_API_URL_IMAGES}${
                              item.ImagenProduct[0].Imagen
                            }`
                          : "/no-image.png"
                      }
                      alt={item.Description}
                      className="h-12 w-12 rounded-lg object-cover"
                    />

                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold text-black">
                        {item.Description}
                      </p>

                      {item.Price && (
                        <span className="text-xs text-gray-500">
                          ${item.Price}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col p-4">
            <NavLink
              to="/productos"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-4 text-white hover:bg-white/10"
            >
              Ver todo
            </NavLink>

            <NavLink
              to="/productos?mascota=perros"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-4 text-white hover:bg-white/10"
            >
              Perros
            </NavLink>

            <NavLink
              to="/productos?mascota=gatos"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-4 text-white hover:bg-white/10"
            >
              Gatos
            </NavLink>

            <NavLink
              to="/productos?mascota=aves"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-4 text-white hover:bg-white/10"
            >
              Aves
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

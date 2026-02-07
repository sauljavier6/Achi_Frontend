import { useEffect, useState } from "react";
import { getProductsCatalog } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../../../api/Post/CategoryApi/CategoryApi";
import { NavLink, useNavigate, useParams } from "react-router-dom";

interface Category {
  ID_Category: number;
  Description: string;
}

interface Stock {
  ID_Stock: number;
  Amount: number;
  Description: string;
  Saleprice: number;
  Purchaseprice: number;
}

interface Imagenes {
  ID_ImagenProduct: number;
  Imagen: string;
}

interface ProductProps {
  ID_Product: number;
  Description: string;
  Code: string;
  Category: Category;
  Stock: Stock[];
  ImagenProduct: Imagenes[];
}

export default function Catalogo() {
  const { id } = useParams();
  const [page] = useState(1);
  const [limit, setLimit] = useState(16);
  const [minPrice] = useState<number | null>(null);

  // UI vs API
  const [maxPriceUI, setMaxPriceUI] = useState(10000);
  const [maxPrice, setMaxPrice] = useState(10000);

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(true);

  const navigate = useNavigate();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setMaxPrice(maxPriceUI);
    }, 400);

    return () => clearTimeout(t);
  }, [maxPriceUI]);

  const { data, isFetching } = useQuery({
    queryKey: ["products", page, limit, minPrice, maxPrice, sortBy, id],
    queryFn: () =>
      getProductsCatalog({
        page,
        limit,
        category: id ? id : null,
        minPrice,
        maxPrice,
        sortBy,
      }),
    placeholderData: (prev) => prev,
  });

  const { data: categorias } = useQuery({
    queryKey: ["ecategories"],
    queryFn: getCategory,
  });

  const total = data?.totalItems || 0;
  const showing = Math.min(limit, total);
  const progress = total ? (showing / total) * 100 : 0;

  useEffect(() => {
    setLimit(16);
  }, [id, minPrice, maxPrice, sortBy]);

  const handleDetailsClick = (e: React.MouseEvent, product: ProductProps) => {
    e.stopPropagation();
    navigate(`/detalles/${product?.ID_Product}`);
  };

  const FiltersContent = () => (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-400">
        <a className="hover:text-primary" href="/productos/">
          Inicio
        </a>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{id}</span>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Categorías
        </h1>
        <div className="flex flex-col gap-1">
          {categorias?.data.map((category: Category) => (
            <NavLink
              key={category.ID_Category}
              to={`/productos/${category.Description}`}
              onClick={() => setFiltersOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition
                ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-primary hover:text-white"
                }`
              }
            >
              <span className="material-symbols-outlined">directions_run</span>
              <p className="text-sm">{category.Description}</p>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="border-b border-gray-100 dark:border-white/5 py-4">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex w-full items-center justify-between text-sm font-bold"
        >
          Rango de Precio
          <span
            className={`material-symbols-outlined transition-transform ${
              priceOpen ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {priceOpen && (
          <div className="mt-4 flex flex-col gap-4">
            <input
              type="range"
              min={0}
              max={10000}
              step={500}
              value={maxPriceUI}
              onChange={(e) => setMaxPriceUI(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>$0</span>
              <span>${maxPriceUI}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 px-4 sm:px-6 md:px-10 lg:px-20 py-8">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 flex-col gap-8 pr-8 border-r border-gray-100 dark:border-white/5 h-fit sticky top-24">
        <FiltersContent />
      </aside>

      {/* Overlay móvil */}
      {filtersOpen && (
        <div
          onClick={() => setFiltersOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Panel filtros móvil */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-[85vw] max-w-[320px] bg-white dark:bg-gray-900 
        transform transition-transform duration-300 
        ${filtersOpen ? "translate-x-0" : "translate-x-full"}
        lg:hidden`}
      >
        <div className="p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="font-black uppercase">Filtros</h2>
            <button onClick={() => setFiltersOpen(false)}>✕</button>
          </div>
          <FiltersContent />
        </div>
      </div>

      {/* Productos */}
      <section className="flex-1 lg:pl-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {id}{" "}
              <span className="text-gray-400 font-normal">
                ({data?.totalItems})
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Explora nuestra última colección de {id}.
            </p>
            {isFetching && (
              <p className="text-xs text-gray-400 animate-pulse mt-2">
                Filtrando productos...
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 text-sm font-bold border border-gray-200 dark:border-white/10 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors lg:hidden"
            >
              <span className="material-symbols-outlined text-lg">tune</span>
              Filtros
            </button>

            <select
              value={sortBy || "newest"}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select text-sm font-bold border-none bg-gray-100 dark:bg-white/5 rounded-lg focus:ring-primary focus:ring-1 pr-10 cursor-pointer"
            >
              <option value="newest">Más recientes</option>
              <option value="bestPrice">Precio: Menor a mayor</option>
              <option value="worstPrice">Precio: Mayor a menor</option>
              <option value="bestSeller">Más populares</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
          {data?.data?.map((product: ProductProps) => (
            <div
              key={product.ID_Product}
              className="product-card group cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={
                    import.meta.env.VITE_API_URL_IMAGES +
                    product.ImagenProduct[0]?.Imagen
                  }
                  alt={product.Description}
                />

                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleDetailsClick(e, product)}
                    className="w-full rounded-lg bg-white/90 backdrop-blur py-3 text-sm font-bold text-gray-900 shadow-xl hover:bg-primary hover:text-white"
                  >
                    Ver Producto
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1 px-1">
                <h3 className="text-base font-bold">
                  {product.Description}
                </h3>
                <p className="mt-1 text-sm font-bold text-primary">
                  ${product.Stock[0]?.Saleprice}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-6 border-t border-gray-100 dark:border-white/5 pt-10">
          <p className="text-sm text-gray-500">
            Mostrando {showing} de {total} productos
          </p>

          <div className="h-1 w-64 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {showing < total && (
            <button
              onClick={() => setLimit(limit + 6)}
              className="rounded-full border-2 px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Ver Más
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

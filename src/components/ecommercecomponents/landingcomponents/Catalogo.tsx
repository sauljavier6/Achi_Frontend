import { useEffect, useState } from "react";
import { getProductsCatalog } from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../../../api/Post/CategoryApi/CategoryApi";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { getSubCategory } from "../../../api/Post/SubCategoryApi/SubCategoryApi";

interface Category {
  ID_Category: number;
  Description: string;
}

interface SubCategory {
  ID_SubCategory: number;
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
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(16);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  console.log("selectedCategoryId", selectedCategoryId);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);

  const { data } = useQuery({
    queryKey: [
      "products",
      page,
      limit,
      sortBy,
      selectedCategoryId,
      selectedSubCategoryId,
    ],
    queryFn: () =>
      getProductsCatalog({
        page,
        limit,
        category: selectedCategoryId,
        subcategory: selectedSubCategoryId,
        sortBy,
      }),
  });

  const { data: subcategorias } = useQuery({
    queryKey: ["esubcategories"],
    queryFn: getSubCategory,
  });

  console.log("subcategorias", subcategorias);

  const { data: categorias } = useQuery({
    queryKey: ["ecategories"],
    queryFn: getCategory,
  });

  useEffect(() => {
    if (!subcategorias?.data) return;

    const mascota = searchParams.get("mascota");

    if (!mascota) {
      setSelectedSubCategoryId(null);
      return;
    }

    const mapa: Record<string, string> = {
      perros: "Perros",
      gatos: "Gatos",
      aves: "Aves",
    };

    const descripcion = mapa[mascota.toLowerCase()];

    if (!descripcion) return;

    const encontrada = subcategorias.data.find(
      (s: SubCategory) =>
        s.Description.toLowerCase() === descripcion.toLowerCase(),
    );

    if (encontrada) {
      setSelectedSubCategoryId(encontrada.ID_SubCategory);
      setSelectedCategoryId(null);
      setPage(1);
    }
  }, [searchParams, subcategorias]);

  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const sortOptions = [
    { label: "Relevancia", value: null },
    { label: "Más recientes", value: "newest" },
    { label: "Precio: Menor a mayor", value: "bestPrice" },
    { label: "Precio: Mayor a menor", value: "worstPrice" },
    { label: "Más populares", value: "bestSeller" },
  ];

  useEffect(() => {
    setLimit(16);
    setPage(1);
  }, [id, sortBy]);

  useEffect(() => {
    const handleClickOutside = () => setSortOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedCategory = categorias?.data?.find(
    (cat: Category) => cat.ID_Category === selectedCategoryId,
  );

  const selectedSubCategory = subcategorias?.data?.find(
    (sub: SubCategory) => sub.ID_SubCategory === selectedSubCategoryId,
  );

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto flex max-w-[1700px] flex-col gap-8 px-4 pb-24 pt-28 md:px-6 xl:px-10 2xl:px-16 lg:flex-row">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-28 space-y-8">
            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
                Mascota
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedSubCategoryId(null);
                    setPage(1);
                  }}
                  className={`flex w-full items-center gap-3 text-left ${
                    !selectedSubCategoryId
                      ? "font-bold text-primary"
                      : "text-on-surface-variant"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded border-2 ${
                      !selectedSubCategoryId
                        ? "border-primary bg-primary"
                        : "border-outline"
                    }`}
                  />
                  Todos
                </button>

                {subcategorias?.data?.map((sub: SubCategory) => {
                  const selected = selectedSubCategoryId === sub.ID_SubCategory;

                  return (
                    <button
                      key={sub.ID_SubCategory}
                      onClick={() => {
                        setSelectedSubCategoryId(sub.ID_SubCategory);
                        setPage(1);
                      }}
                      className={`flex w-full items-center gap-3 text-left transition-colors hover:text-primary ${
                        selected
                          ? "font-bold text-primary"
                          : "text-on-surface-variant"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded border-2 ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-outline"
                        }`}
                      />
                      {sub.Description}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">
                Producto
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setPage(1);
                  }}
                  className={`flex w-full items-center gap-3 text-left ${
                    !selectedCategoryId
                      ? "font-bold text-primary"
                      : "text-on-surface-variant"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded border-2 ${
                      !selectedCategoryId
                        ? "border-primary bg-primary"
                        : "border-outline"
                    }`}
                  />
                  Todos
                </button>

                {categorias?.data?.map((cat: Category) => {
                  const selected = selectedCategoryId === cat.ID_Category;

                  return (
                    <button
                      key={cat.ID_Category}
                      onClick={() => {
                        setSelectedCategoryId(cat.ID_Category);
                        setPage(1);
                      }}
                      className={`flex w-full items-center gap-3 text-left transition-colors hover:text-primary ${
                        selected
                          ? "font-bold text-primary"
                          : "text-on-surface-variant"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded border-2 ${
                          selected
                            ? "border-primary bg-primary"
                            : "border-outline"
                        }`}
                      />
                      {cat.Description}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </aside>

        <section className="flex-1">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
                {selectedCategory
                  ? selectedSubCategory
                    ? `${selectedCategory.Description} • ${selectedSubCategory.Description}`
                    : selectedCategory.Description
                  : selectedSubCategory
                    ? selectedSubCategory.Description
                    : "Todos los productos"}
              </h1>

              <p className="mt-2 text-on-surface-variant">
                Productos seleccionados para tus mascotas.
              </p>
            </div>

            <div className="relative w-full md:w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSortOpen(!sortOpen);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-primary shadow-sm md:w-56"
              >
                {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                  "Relevancia"}
                <FaChevronDown size={12} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 z-40 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl md:w-56">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`block w-full px-4 py-3 text-left text-sm transition ${
                        sortBy === opt.value
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-primary hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 space-y-5 lg:hidden">
            {/* Mascota */}
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                Mascota
              </h3>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => {
                    setSelectedSubCategoryId(null);
                    setSelectedCategoryId(null);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                    !selectedSubCategoryId
                      ? "bg-primary text-white"
                      : "bg-white text-primary shadow-sm"
                  }`}
                >
                  Todos
                </button>

                {subcategorias?.data?.map((sub: SubCategory) => {
                  const selected = selectedSubCategoryId === sub.ID_SubCategory;

                  return (
                    <button
                      key={sub.ID_SubCategory}
                      onClick={() => {
                        setSelectedSubCategoryId(sub.ID_SubCategory);
                        setSelectedCategoryId(null);
                        setPage(1);
                      }}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-white text-primary shadow-sm"
                      }`}
                    >
                      {sub.Description}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Producto */}
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                Producto
              </h3>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                    !selectedCategoryId
                      ? "bg-primary text-white"
                      : "bg-white text-primary shadow-sm"
                  }`}
                >
                  Todos
                </button>

                {categorias?.data?.map((cat: Category) => {
                  const selected = selectedCategoryId === cat.ID_Category;

                  return (
                    <button
                      key={cat.ID_Category}
                      onClick={() => {
                        setSelectedCategoryId(cat.ID_Category);
                        setPage(1);
                      }}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-white text-primary shadow-sm"
                      }`}
                    >
                      {cat.Description}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 2xl:grid-cols-3">
            {data?.data?.map((product: ProductProps) => (
              <ProductCard key={product.ID_Product} {...product} />
            ))}
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition hover:bg-primary-container hover:text-white disabled:opacity-30"
            >
              <FaChevronLeft size={14} />
            </button>

            {pages.map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition ${
                  currentPage === p
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                currentPage < totalPages && goToPage(currentPage + 1)
              }
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition hover:bg-primary-container hover:text-white disabled:opacity-30"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

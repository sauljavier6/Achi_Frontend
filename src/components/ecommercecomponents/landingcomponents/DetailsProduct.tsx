import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  getProductByGender,
  getProductById,
} from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useCart } from "../../../context/CartContext";
import ProductCard from "./ProductCard";

interface Category {
  ID_Category: number;
  Genero: string;
  Description: string;
}

interface Iva {
  ID_Iva: number;
  Description: string;
  Iva: number;
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

interface Product {
  ID_Product: number;
  Description: string;
  Code: string;
  Category: Category;
  Stock: Stock[];
  Iva: Iva;
  ImagenProduct: Imagenes[];
}

interface CartItem {
  ID_Product: number;
  Description: string;
  ID_Stock: number;
  StockDescription: string;
  Saleprice: number;
  Quantity: number;
  Iva: number;
  Imagen?: string;
}

export default function DetailsProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<Stock | null>(null);
  const { state, addItem } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        return;
      }

      try {
        const data = await getProductById(Number(id));

        setProduct(data);

        const firstAvailableStock =
          data.Stock?.find((stock: Stock) => stock.Amount > 0) ||
          data.Stock?.[0] ||
          null;

        setSelectedSize(firstAvailableStock);

        const related = await getProductByGender(
          data.Category.ID_Category,
          data.ID_Product,
        );

        setRelatedProducts(related.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && selectedSize) {
      const cartItem: CartItem = {
        ID_Product: product.ID_Product,
        Description: product.Description,
        ID_Stock: selectedSize.ID_Stock,
        StockDescription: selectedSize.Description,
        Saleprice: selectedSize.Saleprice,
        Quantity: 1,
        Iva: product.Iva.Iva,
        Imagen: product.ImagenProduct?.[0].Imagen || "default-image.jpg",
      };
      addItem(cartItem);
    }
  };

  const img = product?.ImagenProduct;

  const quantityInCart =
    state.items.find(
      (item) =>
        item.ID_Product === product?.ID_Product &&
        item.ID_Stock === selectedSize?.ID_Stock,
    )?.Quantity || 0;

  const handleSelectStock = (stock: Stock) => {
    setSelectedSize({ ...stock });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto max-w-[1500px] px-4 pb-20 pt-28 md:px-8 xl:px-16">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary">
            Inicio
          </Link>
          <span>/</span>
          <Link to="/productos" className="hover:text-primary">
            Productos
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">
            {product?.Category?.Description || "Categoría"}
          </span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Galería */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 overflow-hidden rounded-[32px] border border-outline-variant/30 bg-white shadow-lg">
                <img
                  className="h-[360px] w-full object-contain p-8 transition-transform duration-700 hover:scale-105 md:h-[520px]"
                  src={`${import.meta.env.VITE_API_URL_IMAGES}${
                    img?.[0]?.Imagen || "default-image.jpg"
                  }`}
                  alt={product?.Description || "Producto"}
                />
              </div>

              {[1, 2].map((index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[24px] border border-outline-variant/30 bg-white shadow-md"
                >
                  <img
                    className="h-[160px] w-full object-contain p-4 transition-opacity hover:opacity-90 md:h-[240px]"
                    src={`${import.meta.env.VITE_API_URL_IMAGES}${
                      img?.[index]?.Imagen ||
                      img?.[0]?.Imagen ||
                      "default-image.jpg"
                    }`}
                    alt={product?.Description || "Producto"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info producto */}
          <div className="flex flex-col space-y-8 lg:sticky lg:top-32 lg:col-span-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-tertiary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-on-tertiary">
                  Disponible
                </span>

                <span className="rounded-full bg-secondary-container px-4 py-1.5 text-xs font-bold text-on-secondary-container">
                  {product?.Category?.Description}
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight text-on-surface md:text-5xl">
                {product?.Description}
              </h1>
            </div>

            <p className="text-lg leading-relaxed text-on-surface-variant">
              Producto seleccionado para el cuidado y comodidad de tu mascota.
              Elige una presentación disponible para agregarlo al carrito.
            </p>

            {/* Presentaciones */}
            <div className="space-y-3">
              <span className="text-sm font-bold uppercase tracking-widest text-on-surface">
                Selecciona presentación
              </span>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {product?.Stock.map((stock) => {
                  const isSelected = selectedSize?.ID_Stock === stock.ID_Stock;
                  const isOut = stock.Amount === 0;

                  return (
                    <button
                      key={stock.ID_Stock}
                      onClick={() => {
                        if (isOut) return;

                        handleSelectStock(stock);
                      }}
                      disabled={isOut}
                      className={`rounded-xl border-2 px-4 py-4 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-white shadow-md"
                          : "border-outline-variant bg-white text-on-surface-variant hover:border-primary hover:text-primary"
                      } ${isOut ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      <span className="block truncate text-sm font-bold">
                        {stock.Description}
                      </span>

                      <span className="mt-1 block text-sm font-extrabold">
                        ${stock.Saleprice}
                      </span>

                      <span className="mt-1 block text-xs opacity-80">
                        {isOut ? "Agotado" : `${stock.Amount} disponibles`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón carrito */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={
                  !selectedSize ||
                  selectedSize.Amount === 0 ||
                  quantityInCart >= selectedSize.Amount
                }
                className={`flex-1 rounded-full px-8 py-5 text-lg font-bold shadow-lg transition-all active:scale-95 ${
                  !selectedSize || selectedSize.Amount === 0
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : quantityInCart >= selectedSize.Amount
                      ? "cursor-not-allowed bg-gray-400 text-gray-600"
                      : "bg-primary text-white hover:brightness-110"
                }`}
              >
                {!selectedSize
                  ? "Selecciona una presentación"
                  : selectedSize.Amount === 0
                    ? "Sin stock"
                    : quantityInCart >= selectedSize.Amount
                      ? "Límite alcanzado"
                      : `Agregar al carrito (${quantityInCart})`}
              </button>
            </div>

            {/* Shipping box */}
            <div className="flex items-start gap-4 rounded-[24px] border border-outline-variant/20 bg-surface-container-low p-6">
              <div className="rounded-xl bg-secondary-container p-3 text-on-secondary-container">
                🚚
              </div>

              <div>
                <h4 className="font-bold text-on-surface">
                  Envío seguro para tu pedido
                </h4>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Recibe tus productos en empaque seguro y listo para entrega.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <section className="mt-32 border-t border-outline-variant/30 pt-20">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-primary md:text-5xl">
                Productos relacionados
              </h2>
              <p className="mt-2 text-on-surface-variant">
                También podrían interesarte estos productos.
              </p>
            </div>

            <Link
              to="/productos"
              className="w-fit border-b-2 border-primary pb-1 font-bold text-primary hover:opacity-80"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts?.slice(0, 4).map((product) => (
              <ProductCard
                key={product.ID_Product}
                ID_Product={product.ID_Product}
                Description={product.Description}
                Code={product.Code}
                Category={product.Category}
                Stock={product.Stock}
                ImagenProduct={product.ImagenProduct}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

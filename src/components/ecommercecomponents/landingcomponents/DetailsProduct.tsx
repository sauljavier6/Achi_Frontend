import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProductByGender,
  getProductById,
} from "../../../api/Ecommerce/productsApi/ProductsApi";
import { useCart } from "../../../context/CartContext";

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
  ID_Image: number;
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
      try {
        if (!id) return;
        const numericId = Number(id);

        const data = await getProductById(numericId);
        setProduct(data);

        const related = await getProductByGender(data.Category.Genero);
        setRelatedProducts(related.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    console.log("Adding to cart:");

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

  if (!product) {
    return <p className="text-center mt-10">Loading products...</p>;
  }

  const outOfStock = !selectedSize;

  const quantityInCart =
    state.items.find(
      (item) =>
        item.ID_Product === product.ID_Product &&
        item.ID_Stock === selectedSize?.ID_Stock,
    )?.Quantity || 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 mb-8">
        <a className="hover:text-primary" href="/">
          Inicio
        </a>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <a className="hover:text-primary" href="#">
          {product.Category.Genero}
        </a>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-black dark:text-white">
          {product.Description}
        </span>
      </nav>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {product?.ImagenProduct.map((img, index) => {
              const isMain = index === 0;

              return (
                <div
                  key={img.ID_Image}
                  className={`
                    ${isMain ? "col-span-2" : ""}
                    aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden
                  `}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={`${import.meta.env.VITE_API_URL_IMAGES}${img.Imagen}`}
                    alt={product.Description}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 mt-10 lg:mt-0 lg:sticky lg:top-24">
          <div className="flex flex-col gap-1">
            <span className="text-primary font-bold text-sm uppercase tracking-widest italic">
              Edición Limitada
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
              {product.Description}
            </h1>
            <p className="text-2xl font-bold mb-6">
              {product.Category.Description}{" "}
            </p>
          </div>
          <div className="space-y-6">
            <div></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase">
                  Seleccionar Talla
                </h3>
                <button className="text-xs font-bold underline text-gray-500 hover:text-black dark:hover:text-white transition-colors uppercase">
                  Guía de tallas
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.Stock.map((stock) => {
                  const label = stock.Description.replace("Talla ", "");

                  const isSelected = selectedSize?.ID_Stock === stock.ID_Stock;
                  const isOut = stock.Amount === 0;

                  return (
                    <button
                      key={stock.ID_Stock}
                      onClick={() => !isOut && setSelectedSize(stock)}
                      disabled={isOut}
                      className={`
            py-3 text-sm font-bold border-2 rounded-lg transition-all
            ${
              isSelected
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                : "border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white"
            }
            ${isOut && "opacity-40 cursor-not-allowed relative overflow-hidden"}
          `}
                    >
                      {isOut && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-[1px] bg-gray-400 -rotate-45"></span>
                        </span>
                      )}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={
                  selectedSize?.Amount === 0 ||
                  outOfStock ||
                  quantityInCart >= selectedSize?.Amount
                }
                className={`w-full py-5 rounded-full font-black uppercase italic tracking-widest text-lg transition-all flex items-center justify-center gap-3
        ${
          selectedSize?.Amount === 0 ||
          outOfStock ||
          quantityInCart >= selectedSize?.Amount
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-black dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white"
        }
      `}
              >
                {selectedSize?.Amount === 0 || outOfStock
                  ? "Sin stock"
                  : quantityInCart >= selectedSize?.Amount
                    ? "Límite alcanzado"
                    : `Añadir al carrito (${quantityInCart})`}

                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <button className="flex items-center justify-between w-full text-left py-2">
                  <span className="text-sm font-bold uppercase">
                    Envío y Devoluciones Gratuitas
                  </span>
                  <span className="material-symbols-outlined">
                    local_shipping
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">
              Completa tu Look
            </h2>
            <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mt-1">
              Recomendados para ti
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts?.map((p) => (
            <div key={p.ID_Product} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4 relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={`${import.meta.env.VITE_API_URL_IMAGES}${p.ImagenProduct?.[0]?.Imagen}`}
                  alt={p.Description}
                />
                <button className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur text-black py-2 rounded-lg font-bold text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Vista Rápida
                </button>
              </div>

              <h3 className="font-bold text-sm uppercase">{p.Description}</h3>

              <p className="text-gray-500 text-sm">
                ${p.Stock?.[0]?.Saleprice}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

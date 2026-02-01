import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  getProductByGender,
  getProductById,
} from "../../../api/Ecommerce/productsApi/ProductsApi";

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

export default function ShoppingCart() {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const {
    state,
    removeItem,
    increaseQty,
    decreaseQty,
    getSubTotal,
    getIva,
    getTotal,
  } = useCart();
  const navigate = useNavigate();

  const handlePagar = () => {
    navigate("/stripe", { state: { amount: getTotal() } });
    alert("Sera redireccionado a la pasarela de pago.");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!state.items[0].ID_Product) return;
        const numericId = Number(state.items[0].ID_Product);

        const data = await getProductById(numericId);

        const related = await getProductByGender(data.Category.Genero);
        setRelatedProducts(related.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [state?.items[0]?.ID_Product]);

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#1b0d0f] dark:text-white min-h-screen">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 mb-6">
          <a
            className="text-[#9a4c52] dark:text-[#c47c82] text-sm font-medium hover:underline"
            href="/"
          >
            Inicio
          </a>
          <span className="text-[#9a4c52] dark:text-[#c47c82] text-sm">/</span>
          <span className="text-[#1b0d0f] dark:text-white text-sm font-bold">
            Carrito
          </span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="mb-8">
              <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase">
                Tu Carrito
              </h2>
              <p className="text-[#9a4c52] dark:text-[#c47c82] text-lg font-medium">
                {state.items.length} artículos en tu bolsa
              </p>
            </div>

            {(() => {
              const FREE_SHIPPING = 2000;
              const total = getTotal();
              const remaining = Math.max(FREE_SHIPPING - total, 0);
              const percent = Math.min((total / FREE_SHIPPING) * 100, 100);

              return (
                <div className="bg-white dark:bg-[#2d181a] p-5 rounded-xl border border-[#f3e7e8] dark:border-[#3d2023] mb-8 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        local_shipping
                      </span>

                      {remaining > 0
                        ? `Faltan $${remaining.toFixed(2)} para envío gratis`
                        : "🎉 ¡Ya tienes envío gratis!"}
                    </p>

                    <p className="text-xs font-bold text-primary">
                      {percent.toFixed(0)}%
                    </p>
                  </div>

                  <div className="h-2 w-full bg-[#f3e7e8] dark:bg-[#3d2023] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <p className="mt-2 text-xs text-[#9a4c52] dark:text-[#c47c82]">
                    {remaining > 0
                      ? "¡Casi lo tienes! Agrega un accesorio para ahorrar en el envío."
                      : "Disfruta tu envío sin costo 🚀"}
                  </p>
                </div>
              );
            })()}

            <div className="space-y-4">
              {state.items.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Tu carrito está vacío.
                </p>
              ) : (
                state.items.map((item) => (
                  <div
                    key={item.ID_Product}
                    className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-[#2d181a] p-4 rounded-xl border border-[#f3e7e8] dark:border-[#3d2023] transition-all hover:shadow-md"
                  >
                    <div
                      className="size-32 flex-shrink-0 bg-center bg-no-repeat bg-cover rounded-lg"
                      data-alt="zapatillas nike air max negras y rojas"
                      style={{
                        backgroundImage: `url(${import.meta.env.VITE_API_URL_IMAGES}${item.Imagen})`,
                      }}
                    ></div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold leading-none mb-2">
                            {item.Description}
                          </h3>
                          <p className="text-lg font-black text-primary">
                            ${item.Saleprice}
                          </p>
                        </div>
                        <p className="text-[#9a4c52] dark:text-[#c47c82] text-sm">
                          Talla: {item.StockDescription}
                        </p>
                        <p className="text-[#9a4c52] dark:text-[#c47c82] text-sm mt-1">
                          Ref: {item.Description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              decreaseQty({
                                ID_Product: item.ID_Product,
                                ID_Stock: item.ID_Stock,
                              })
                            }
                            className="size-8 flex items-center justify-center rounded-lg bg-[#f3e7e8] dark:bg-[#3d2023] hover:bg-primary hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              remove
                            </span>
                          </button>
                          <span className="text-base font-bold w-4 text-center">
                            {item.Quantity}
                          </span>
                          <button
                            onClick={() =>
                              increaseQty({
                                ID_Product: item.ID_Product,
                                ID_Stock: item.ID_Stock,
                              })
                            }
                            className="size-8 flex items-center justify-center rounded-lg bg-[#f3e7e8] dark:bg-[#3d2023] hover:bg-primary hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              add
                            </span>
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            removeItem({
                              ID_Product: item.ID_Product,
                              ID_Stock: item.ID_Stock,
                            })
                          }
                          className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                          ELIMINAR
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-12 border-t border-[#f3e7e8] dark:border-[#3d2023] pt-8">
              <h4 className="text-lg font-black uppercase mb-6 tracking-tight">
                Tal vez te interese
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((product) => {
                  const image = product.ImagenProduct?.[0]?.Imagen;

                  return (
                    <div
                      key={product.ID_Product}
                      className="space-y-2 cursor-pointer"
                      onClick={() =>
                        navigate(`/detalles/${product.ID_Product}`)
                      }
                    >
                      <div
                        className="aspect-square bg-white dark:bg-[#2d181a] rounded-lg bg-cover bg-center transition-all hover:scale-105"
                        style={{
                          backgroundImage: image
                            ? `url(${import.meta.env.VITE_API_URL_IMAGES}${image})`
                            : "none",
                        }}
                      ></div>

                      <p className="text-xs font-bold truncate">
                        {product.Description}
                      </p>

                      <p className="text-xs text-primary font-black">
                        ${product.Stock?.[0]?.Saleprice ?? "0.00"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-[#2d181a] rounded-xl border border-[#f3e7e8] dark:border-[#3d2023] p-6 shadow-sm">
                <h3 className="text-xl font-black uppercase mb-6 tracking-tight">
                  Resumen del Pedido
                </h3>

                <div className="mb-6">
                  <p className="text-sm font-bold mb-2">
                    ¿Tienes un código de descuento?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      className="w-full flex-1 rounded-lg border-[#f3e7e8] dark:border-[#3d2023] bg-background-light dark:bg-background-dark text-sm focus:ring-primary focus:border-primary"
                      placeholder="Ingresar código"
                      type="text"
                    />
                    <button className="w-full sm:w-auto px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-black rounded-lg hover:opacity-80 transition-opacity uppercase">
                      Aplicar
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#f3e7e8] dark:border-[#3d2023]">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-bold">
                      ${getSubTotal().toFixed(2)}
                    </span>
                  </div>
                  {/*<div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Envío Estimado
                    </span>
                    <span className="font-bold text-green-600">$5.00</span>
                  </div>*/}
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Impuestos
                    </span>
                    <span className="font-bold">${getIva().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-[#f3e7e8] dark:border-[#3d2023]">
                    <span className="text-lg font-black uppercase">Total</span>
                    <span className="text-2xl font-black text-primary">
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePagar}
                  className="w-full bg-primary text-white py-4 rounded-xl mt-8 text-lg font-black uppercase tracking-wider hover:bg-red-700 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  Finalizar Compra
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>

                <div className="mt-6 flex flex-col gap-3">
                  <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                    Pagos Seguros Garantizados
                  </p>
                  <div className="flex justify-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <span className="material-symbols-outlined text-3xl">
                      credit_card
                    </span>
                    <span className="material-symbols-outlined text-3xl">
                      account_balance_wallet
                    </span>
                    <span className="material-symbols-outlined text-3xl">
                      contactless
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-[#1b0d0f] rounded-xl p-5 border border-dashed border-gray-300 dark:border-gray-700">
                <div className="flex gap-4 items-start">
                  <span className="material-symbols-outlined text-gray-500">
                    info
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase mb-1">
                      Información de Envío
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      Los tiempos de entrega pueden variar según la ubicación.
                      Devoluciones gratuitas durante 30 días para miembros del
                      club.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

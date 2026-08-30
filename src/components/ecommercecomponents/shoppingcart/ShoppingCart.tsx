import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import {
  FaMinus,
  FaPlus,
  FaTrash,
  FaShoppingCart,
  FaShieldAlt,
  FaHeadset,
  FaTruck,
  FaWallet,
} from "react-icons/fa";

export default function ShoppingCart() {
  const navigate = useNavigate();

  const {
    state,
    removeItem,
    increaseQty,
    decreaseQty,
    getSubTotal,
    getIva,
    getTotal,
    getEnvio,
  } = useCart();

  const handleSubmit = () => {
    if (state.items.length === 0) return;

    navigate("/pago");
  };

  const subtotal = getSubTotal();
  const envio = subtotal === 0 ? 0 : getEnvio();
  const iva = getIva();
  const total = subtotal === 0 ? 0 : getTotal();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto mt-24 w-full max-w-[1500px] px-4 pb-20 md:px-8 xl:px-16">
        <h1 className="mb-8 text-4xl font-extrabold text-primary md:mb-10 md:text-5xl">
          Tu Carrito
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Columna izquierda */}
          <section className="space-y-6 lg:col-span-7">
            {state.items.length === 0 ? (
              <div className="rounded-[32px] border border-outline-variant/30 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <FaShoppingCart size={26} />
                </div>

                <h2 className="text-2xl font-bold text-primary">
                  Tu carrito está vacío
                </h2>

                <p className="mt-2 text-on-surface-variant">
                  Agrega productos para continuar con tu compra.
                </p>

                <button
                  onClick={() => navigate("/productos")}
                  className="mt-8 rounded-full bg-primary px-8 py-4 font-bold text-white transition active:scale-95"
                >
                  Ver productos
                </button>
              </div>
            ) : (
              state.items.map((item) => (
                <article
                  key={`${item.ID_Product}-${item.ID_Stock}`}
                  className="rounded-[32px] border border-outline-variant/30 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex sm:gap-6 md:p-6"
                >
                  {/* Imagen */}
                  <div className="h-40 w-full flex-shrink-0 overflow-hidden rounded-[24px] bg-primary-container/10 sm:h-32 sm:w-32">
                    <img
                      className="h-full w-full object-cover"
                      src={`${import.meta.env.VITE_API_URL_IMAGES}${item.Imagen}`}
                      alt={item.Description}
                    />
                  </div>

                  {/* Info */}
                  <div className="mt-5 flex flex-1 flex-col justify-between sm:mt-0">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold leading-tight text-on-surface">
                            {item.Description}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-on-surface-variant">
                            Presentación: {item.StockDescription}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            removeItem({
                              ID_Product: item.ID_Product,
                              ID_Stock: item.ID_Stock,
                            })
                          }
                          className="rounded-full p-2 text-on-surface-variant transition hover:bg-error-container hover:text-error"
                          aria-label="Eliminar producto"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4">
                      {/* Cantidad */}
                      <div className="flex items-center gap-4 rounded-full bg-surface-container px-4 py-2">
                        <button
                          onClick={() =>
                            decreaseQty({
                              ID_Product: item.ID_Product,
                              ID_Stock: item.ID_Stock,
                            })
                          }
                          className="text-primary transition hover:opacity-70"
                          aria-label="Disminuir cantidad"
                        >
                          <FaMinus size={12} />
                        </button>

                        <span className="min-w-6 text-center text-sm font-bold">
                          {item.Quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQty({
                              ID_Product: item.ID_Product,
                              ID_Stock: item.ID_Stock,
                            })
                          }
                          className="text-primary transition hover:opacity-70"
                          aria-label="Aumentar cantidad"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>

                      {/* Precio */}
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-primary">
                          {item.Saleprice === 0
                            ? "$0.00"
                            : `$${(item.Saleprice * item.Quantity).toFixed(2)}`}
                        </p>
                        <p className="text-xs font-semibold uppercase text-outline">
                          Subtotal
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}

            {/* Badges */}
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-[24px] border border-tertiary/20 bg-tertiary-fixed/30 p-4">
                <FaShieldAlt className="text-primary" />
                <span className="text-sm font-bold text-on-tertiary-fixed-variant">
                  Compra segura
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-[24px] border border-secondary/20 bg-secondary-fixed/30 p-4">
                <FaHeadset className="text-primary" />
                <span className="text-sm font-bold text-on-secondary-fixed-variant">
                  Atención experta
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-[24px] border border-secondary/20 bg-secondary-fixed/30 p-4">
                <FaTruck className="text-primary" />
                <span className="text-sm font-bold text-on-secondary-fixed-variant">
                  Envío disponible
                </span>
              </div>
            </div>
          </section>

          {/* Columna derecha */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-[32px] border border-outline-variant/30 bg-surface-container-low p-6 shadow-xl md:p-8">
                <h2 className="mb-6 text-2xl font-bold text-on-surface">
                  Resumen de Pedido
                </h2>

                <div className="mb-8 space-y-4">
                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="font-bold text-on-surface">
                      {subtotal === 0 ? "$0.00" : `$${subtotal.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>IVA</span>
                    <span className="font-bold text-on-surface">
                      {iva === 0 ? "$0.00" : `$${iva.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-on-surface-variant">
                    <span>Envío</span>
                    <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold text-tertiary">
                      {envio === 0 ? "$0.00" : `$${envio.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="h-px bg-outline-variant/40" />

                  <div className="flex justify-between pt-2 text-2xl font-extrabold text-primary">
                    <span>Total</span>
                    <span>
                      {total === 0 ? "$0.00" : `$${total.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Formulario visual */}
                <form className="space-y-5">
                  <div>
                    <label className="mb-3 block text-sm font-bold text-on-surface-variant">
                      Método de pago
                    </label>

                    <div className="grid grid-cols-1 gap-4">
                      <button
                        type="button"
                        className="flex flex-col items-center justify-center rounded-2xl border border-primary bg-primary/10 p-4 text-primary"
                      >
                        <FaWallet className="mb-2 text-secondary" size={24} />
                        <span className="text-sm font-bold">Mercado Pago</span>
                        <span className="mt-1 text-xs">Tarjeta, SPEI, efectivo o saldo</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={state.items.length === 0}
                    className="mt-4 w-full rounded-full bg-primary-fixed py-5 text-lg font-extrabold uppercase tracking-wide text-on-primary-fixed shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Completar compra
                  </button>
                </form>
              </div>

              <p className="px-6 text-center text-xs font-medium text-outline">
                Al completar tu compra aceptas los términos de servicio y la
                política de privacidad.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

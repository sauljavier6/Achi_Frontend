// PaymentPage.tsx
import React, { useState } from "react";
import { Savesale } from "../../../api/Ecommerce/stripeApi/StripeApi";
import { useCart } from "../../../context/CartContext";
import { toast } from "react-toastify";

export default function PayProducts() {
  const { state, getSubTotal, getIva, getTotal, clearCart, getEnvio } =
    useCart();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<7 | 6>(6);
  console.log(loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Ingresa tu nombre completo");
      return;
    }

    if (!phone.trim()) {
      alert("Ingresa tu teléfono");
      return;
    }

    if (!email.trim()) {
      alert("Ingresa tu correo");
      return;
    }

    if (!email.includes("@")) {
      alert("Correo inválido");
      return;
    }

    if (!address.trim()) {
      alert("Ingresa tu dirección");
      return;
    }

    if (!paymentMethod) {
      alert("Selecciona un método de pago");
      return;
    }

    setLoading(true);
    try {
      const savesale = await Savesale({
        name: name,
        email: email,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        items: state.items,
        total: getTotal(),
        subtotal: getSubTotal(),
        iva: getIva(),
      });

      if (!savesale) {
        toast.error("Errar al registrar compra", {
          position: "top-right",
        });
      }

      toast.success("Compra registrada", {
        position: "top-right",
        progressClassName: "custom-progress",
      });
      clearCart();
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al procesar", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-slate-100 min-h-screen">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 flex flex-col gap-10">
            <section>
              <div className="flex items-center gap-4 mb-6">
                <span className="size-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Opciones de Entrega
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">
                    Nombre completo
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-lg p-3 text-sm focus:border-primary outline-none transition-all"
                    placeholder="Juan Pérez"
                    type="text"
                  />
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">
                    Teléfono
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-lg p-3 text-sm focus:border-primary outline-none transition-all"
                    placeholder="664-333-3433"
                    type="tel"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">
                    Correo electrónico
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-lg p-3 text-sm focus:border-primary outline-none transition-all"
                    placeholder="Ejemplo@gmail.com"
                    type="email"
                  />
                </div>

                {/* Dirección (si quieres otro estado luego) */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">
                    Dirección
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-lg p-3 text-sm focus:border-primary outline-none transition-all"
                    placeholder="Av. Principal 123, Depto 4B"
                    type="text"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />
            <section>
              <div className="flex items-center gap-4 mb-6">
                <span className="size-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Método de Pago
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod(6)}
                  className={`flex flex-col items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all
                  ${
                    paymentMethod === 6
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary"
                  }
                `}
                >
                  <span className="material-symbols-outlined text-2xl">
                    account_balance
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    Transferencia
                  </span>
                </button>

                <button
                  onClick={() => setPaymentMethod(7)}
                  className={`flex flex-col items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all
                  ${
                    paymentMethod === 7
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary"
                  }
                `}
                >
                  <span className="material-symbols-outlined text-2xl">
                    payments
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    Deposito
                  </span>
                </button>
              </div>

              {paymentMethod === 6 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary">
                      info
                    </span>
                    <h3 className="text-sm font-black uppercase">
                      Detalles de Transferencia Bancaria
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Banco
                        </p>
                        <p className="font-bold">BBVA Bancomer</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Titular
                        </p>
                        <p className="font-bold">
                          Cristian Jair Salazar Macías
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Número de tarjeta
                        </p>
                        <p className="font-bold font-mono tracking-tight">
                          4152 3138 9371 4084
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Concepto
                        </p>
                        <p className="font-bold">PEDIDO #000 (Indispensable)</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-[11px] text-slate-500 leading-relaxed italic border-t border-slate-200 dark:border-slate-800 pt-4">
                    * El pedido se procesará una vez confirmado el recibo de la
                    transferencia (aprox. 24–48 hrs hábiles).
                  </p>

                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed italic">
                    Es necesario enviar el comprobante de pago por WhatsApp al:
                    <span className="font-bold"> 663 403 2690</span>
                  </p>
                </div>
              )}

              {paymentMethod === 7 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary">
                      storefront
                    </span>
                    <h3 className="text-sm font-black uppercase">
                      Depósito en OXXO / 7-Eleven / Farmacias
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Banco
                        </p>
                        <p className="font-bold">BBVA Bancomer</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Titular
                        </p>
                        <p className="font-bold">Cristian Jair Salazar Macías</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Número de tarjeta
                        </p>
                        <p className="font-bold font-mono tracking-tight">
                          4152 3138 9371 4084
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-[11px] text-slate-500 leading-relaxed italic border-t border-slate-200 dark:border-slate-800 pt-4">
                    * Realiza tu depósito o transferencia desde BBVA o en
                    tiendas OXXO, 7-Eleven, Farmacia Guadalajara o tienda
                    afiliada.
                  </p>

                  <p className="mt-4 text-[11px] text-slate-500 leading-relaxed italic">
                    * Envía la foto del comprobante por WhatsApp para liberar tu
                    pedido más rápido.
                  </p>

                  <p className="mt-4 text-[11px] font-bold text-slate-600">
                    WhatsApp: 663 403 2690
                  </p>
                </div>
              )}
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />
            <section>
              <div className="flex items-center gap-4 mb-6">
                <span className="size-8 border-2 border-slate-200 dark:border-slate-700 text-slate-400 rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-400">
                  Revisión Final
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium italic">
                Revisa los detalles de tu compra antes de confirmar.
              </p>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6">
                Resumen del Pedido
              </h3>
              <div className="flex flex-col gap-5 mb-8">
                {state?.items?.map((item) => (
                  <div
                    key={`${item.ID_Product}-${item.ID_Stock}`}
                    className="flex gap-4"
                  >
                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        alt={item.Description}
                        className="w-full h-full object-cover"
                        src={
                          import.meta.env.VITE_API_URL_IMAGES + item.Imagen ||
                          "/no-image.png"
                        }
                      />
                    </div>

                    <div className="flex flex-col justify-center gap-1">
                      <p className="text-sm font-bold leading-tight">
                        {item.Description}
                      </p>

                      <p className="text-xs text-[#4c739a]">
                        {item.StockDescription}
                      </p>

                      <p className="text-sm font-black mt-1">
                        ${item.Saleprice}
                      </p>

                      <p className="text-xs text-gray-500">
                        Cantidad: {item.Quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 py-6 border-y border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-bold">${getSubTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">
                    Envío Estándar
                  </span>
                  <span className="font-bold text-green-600">
                    ${getEnvio().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Impuestos</span>
                  <span className="font-bold">${getIva().toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-6 mb-2">
                <span className="text-lg font-black uppercase tracking-tight">
                  Total
                </span>
                <span className="text-3xl font-black tracking-tighter">
                  ${getTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Confirmar Pedido
              </button>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    sell
                  </span>
                  <input
                    className="bg-transparent border-none p-0 text-xs focus:ring-0 w-full placeholder:text-slate-400 font-bold uppercase tracking-wider"
                    placeholder="CÓDIGO PROMO"
                    type="text"
                  />
                  <button className="text-xs font-black uppercase text-black dark:text-white">
                    Aplicar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-400 text-lg">
                verified_user
              </span>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Al completar tu compra, aceptas que valentto mx procese tus
                datos según nuestra Política de Privacidad. El tiempo estimado
                de entrega es de 2-4 días hábiles.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

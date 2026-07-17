// PaymentPage.tsx
import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import {
  payment,
  Savesale,
  updateSale,
} from "../../api/Ecommerce/stripeApi/StripeApi";
import { FaShieldAlt, FaHeadset } from "react-icons/fa";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

function CheckoutFormInner() {
  const { state, getSubTotal, getIva, getTotal, clearCart, getEnvio } =
    useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();

  const paymentMethod = location.state?.paymentMethod ?? 2;

  const [cardComplete, setCardComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    colonia: "",
    city: "",
    cp: "",
    paymentMethod: 2 as 2 | 6 | 7,
    loading: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (!form.name.trim()) {
      setMessage("Ingresa el nombre completo.");
      return;
    }

    if (!form.phone.trim()) {
      setMessage("Ingresa el teléfono.");
      return;
    }

    if (!form.email.trim()) {
      setMessage("Ingresa el correo electrónico.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      setMessage("Ingresa un correo electrónico válido.");
      return;
    }

    if (!form.address.trim()) {
      setMessage("Ingresa la calle y número.");
      return;
    }

    if (!form.colonia.trim()) {
      setMessage("Ingresa la colonia.");
      return;
    }

    if (!form.city.trim()) {
      setMessage("Ingresa la ciudad.");
      return;
    }

    if (!form.cp.trim()) {
      setMessage("Ingresa el código postal.");
      return;
    }

    if (!/^\d{5}$/.test(form.cp)) {
      setMessage("El código postal debe contener 5 dígitos.");
      return;
    }

    if (state.items.length === 0) {
      setMessage("El carrito está vacío.");
      return;
    }

    if (paymentMethod === 2 && (!stripe || !elements)) {
      setMessage("El formulario de pago aún no está listo.");
      return;
    }

    setLoading(true);

    try {
      // TOTAL
      const amount = Math.round(getTotal() * 100);

      // 1. GUARDAR VENTA COMO PENDIENTE
      const savesale = await Savesale({
        address:
          form.address +
          ", " +
          form.colonia +
          ", " +
          form.city +
          ", " +
          form.cp,
        name: form.name,
        email: form.email,
        phone: form.phone,
        items: state.items,
        total: getTotal(),
        subtotal: getSubTotal(),
        iva: getIva(),
        envio: getEnvio(),
      });

      console.log("Venta creada:", savesale);

      // OBTENER ID VENTA
      const saleId = savesale.saleId;

      if (paymentMethod === 6) {
        setMessage(
          `✅ Pedido generado correctamente. Número de venta: ${saleId}. Realiza tu transferencia usando este número como concepto y envía tu comprobante por WhatsApp al 664 782 8882.`,
        );

        clearCart();
        setLoading(false);
        return;
      }

      console.log("saleId:", saleId);

      if (
        paymentMethod === 2 &&
        (!cardComplete.number || !cardComplete.expiry || !cardComplete.cvc)
      ) {
        setMessage("Completa correctamente los datos de la tarjeta.");
        return;
      }

      // 2. CREAR PAYMENT INTENT
      const data = await payment({
        amount,
        items: state.items,
        name: form.name,
      });

      if (!elements) {
        setMessage("Error: elementos de pago no disponibles");
        return;
      }

      // OBTENER TARJETA
      const cardNumber = elements.getElement(CardNumberElement);

      if (!cardNumber) {
        setMessage("Tarjeta inválida");
        return;
      }

      if (!stripe) {
        setMessage("Error: Stripe no está disponible");
        return;
      }

      // 3. PROCESAR PAGO
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
        },
      });

      // ERROR STRIPE
      if (result.error) {
        setMessage(result.error.message || "Error en el pago");
        return;
      }

      // 4. PAGO EXITOSO
      if (result.paymentIntent?.status === "succeeded") {
        // ACTUALIZAR VENTA A PAGADA
        await updateSale({
          saleId,
          paymentId: result.paymentIntent.id,
          items: state.items,
          total: getTotal(),
        });

        setMessage("✅ Pago exitoso!");

        clearCart();

        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);

      setMessage("❌ Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#111827",
        "::placeholder": { color: "#9ca3af" },
      },
      invalid: { color: "#ef4444" },
    },
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto w-full max-w-[1500px] px-4 py-10 md:px-8 xl:px-16">
        <h1 className="headline mt-16 mb-10 text-center text-3xl font-extrabold text-primary md:mt-20 md:text-5xl">
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <section className="lg:col-span-8">
            <div className="rounded-2xl bg-white p-6 sm:shadow-md">
              <h2 className="mb-6 text-center text-2xl font-bold">
                Datos de pago
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="ml-1 text-xs font-bold uppercase text-outline">
                      Nombre Completo
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                      placeholder="Ej. Juan Pérez"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="ml-1 text-xs font-bold uppercase text-outline">
                      Teléfono
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                      placeholder="+52 664 000 0000"
                      type="tel"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="ml-1 text-xs font-bold uppercase text-outline">
                      Correo
                    </label>
                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                      placeholder="correo@ejemplo.com"
                      type="email"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="ml-1 text-xs font-bold uppercase text-outline">
                      Calle y Número
                    </label>
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                      placeholder="Calle, número"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="ml-1 text-xs font-bold uppercase text-outline">
                      Colonia
                    </label>
                    <input
                      value={form.colonia}
                      onChange={(e) =>
                        setForm({ ...form, colonia: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                      placeholder="Colonia"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="ml-1 text-xs font-bold uppercase text-outline">
                      Ciudad
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                      placeholder="Tijuana"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="ml-1 text-xs font-bold uppercase text-outline">
                      Código Postal
                    </label>
                    <input
                      value={form.cp}
                      onChange={(e) => setForm({ ...form, cp: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
                      placeholder="22000"
                      type="text"
                    />
                  </div>
                </div>

                {paymentMethod === 2 && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Número de tarjeta
                      </label>

                      <div className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 shadow-sm transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
                        <CardNumberElement
                          options={elementOptions}
                          onChange={(e) =>
                            setCardComplete((p) => ({
                              ...p,
                              number: e.complete,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                          Vencimiento
                        </label>

                        <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
                          <CardExpiryElement
                            options={elementOptions}
                            onChange={(e) =>
                              setCardComplete((p) => ({
                                ...p,
                                expiry: e.complete,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                          CVC
                        </label>

                        <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
                          <CardCvcElement
                            options={elementOptions}
                            onChange={(e) =>
                              setCardComplete((p) => ({
                                ...p,
                                cvc: e.complete,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 6 && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                    <h3 className="font-bold text-primary">
                      Pago por transferencia
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      Al confirmar, generaremos tu número de venta. Usa ese
                      número como concepto de transferencia y envía tu
                      comprobante por WhatsApp al
                      <strong> 664 782 8882</strong>.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    state.items.length === 0 ||
                    (paymentMethod === 2 && !stripe)
                  }
                  className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Procesando..."
                    : paymentMethod === 6
                      ? "Generar pedido para transferencia"
                      : `Pagar $${getTotal().toFixed(2)}`}
                </button>

                {message && (
                  <p className="mt-3 text-center text-lg font-semibold text-red-600">
                    {message}
                  </p>
                )}
              </form>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Resumen de Pedido
                  </h2>

                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    Seguro
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal productos</span>
                    <span className="font-bold text-gray-900">
                      ${getSubTotal().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Envío</span>
                    <span className="font-bold text-secondary">
                      {getSubTotal() === 0
                        ? "$0.00"
                        : `$${getEnvio().toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">IVA</span>
                    <span className="font-bold text-gray-900">
                      ${getIva().toFixed(2)}
                    </span>
                  </div>

                  <div className="my-5 border-t border-gray-200" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-500">
                        Total a pagar
                      </p>
                      <p className="text-xs text-gray-400">
                        Incluye envío e impuestos
                      </p>
                    </div>

                    <span className="text-3xl font-extrabold text-primary">
                      ${getSubTotal() === 0 ? "0.00" : getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                  <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-gray-500">
                    <FaShieldAlt className="shrink-0 text-primary" />
                    Pago 100% seguro con cifrado SSL
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                    <FaHeadset className="text-3xl" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                      ¿Necesitas ayuda?
                    </p>

                    <p className="mt-1 text-lg font-extrabold leading-tight">
                      Asistencia Farmacéutica 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner />
    </Elements>
  );
}

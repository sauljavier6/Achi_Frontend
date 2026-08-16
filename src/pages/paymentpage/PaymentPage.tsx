import { useState } from "react";
import type { FormEvent } from "react";
import { FaHeadset, FaShieldAlt } from "react-icons/fa";
import { createCheckout } from "../../api/Ecommerce/mercadoPagoApi/MercadoPagoApi";
import { useCart } from "../../context/CartContext";

export default function PaymentPage() {
  const { state, getSubTotal, getIva, getTotal, getEnvio, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", colonia: "", city: "", cp: "" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.colonia.trim() || !form.city.trim()) {
      return setMessage("Completa todos los datos de contacto y entrega.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setMessage("Ingresa un correo válido.");
    if (!/^\d{5}$/.test(form.cp)) return setMessage("El código postal debe contener 5 dígitos.");
    if (state.items.length === 0) return setMessage("El carrito está vacío.");

    setLoading(true);
    try {
      const checkout = await createCheckout({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: `${form.address}, ${form.colonia}, ${form.city}, ${form.cp}`,
        items: state.items.map(({ ID_Product, ID_Stock, Quantity }) => ({ ID_Product, ID_Stock, Quantity })),
      });
      clearCart();
      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al procesar el pedido");
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof typeof form, label: string, placeholder: string, type = "text") => (
    <label className="flex flex-col gap-2 text-sm font-bold text-gray-700">
      {label}
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder} className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal outline-none focus:border-primary focus:ring-4 focus:ring-primary/20" />
    </label>
  );

  return <main className="mx-auto mt-24 w-full max-w-[1200px] px-4 pb-20">
    <h1 className="mb-10 text-center text-4xl font-extrabold text-primary">Finalizar compra</h1>
    <div className="grid gap-8 lg:grid-cols-12">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-7 shadow-md lg:col-span-8">
        <h2 className="text-2xl font-bold">Datos de entrega</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {field("name", "Nombre completo", "Juan Pérez")}
          {field("phone", "Teléfono", "+52 664 000 0000", "tel")}
          <div className="md:col-span-2">{field("email", "Correo", "correo@ejemplo.com", "email")}</div>
          {field("address", "Calle y número", "Av. Principal 123")}
          {field("colonia", "Colonia", "Zona Centro")}
          {field("city", "Ciudad", "Tijuana")}
          {field("cp", "Código postal", "22000")}
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-bold text-primary">Pago seguro con Mercado Pago</h3>
          <p className="mt-2 text-sm text-gray-600">
            Podrás elegir tarjeta, transferencia SPEI, efectivo o saldo. La venta solo se confirmará cuando Mercado Pago notifique el pago aprobado.
          </p>
        </div>
        <button disabled={loading} className="w-full rounded-full bg-primary py-4 font-bold text-white disabled:opacity-50">
          {loading ? "Procesando…" : `Continuar a Mercado Pago · $${getTotal().toFixed(2)}`}
        </button>
        {message && <p className="text-center font-semibold text-red-600">{message}</p>}
      </form>
      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-3xl bg-white p-7 shadow-md">
          <h2 className="mb-5 text-xl font-bold">Resumen</h2>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><b>${getSubTotal().toFixed(2)}</b></p>
            <p className="flex justify-between"><span>IVA</span><b>${getIva().toFixed(2)}</b></p>
            <p className="flex justify-between"><span>Envío</span><b>${getEnvio().toFixed(2)}</b></p>
            <p className="flex justify-between border-t pt-4 text-xl text-primary"><b>Total</b><b>${getTotal().toFixed(2)}</b></p>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-gray-500"><FaShieldAlt /> El servidor verifica precios, inventario y confirmación del pago.</p>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-primary p-6 text-white"><FaHeadset className="text-3xl" /><b>¿Necesitas ayuda? Contáctanos.</b></div>
      </aside>
    </div>
  </main>;
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatFolio } from "../../utils/folio";
import { useCart } from "../../context/CartContext";

type ReconcileResult = { message?: string; saleId?: number };
const reconciliationRequests = new Map<string, Promise<ReconcileResult>>();

function reconcilePayment(paymentId: string) {
  const existing = reconciliationRequests.get(paymentId);
  if (existing) return existing;
  const request = fetch(`${import.meta.env.VITE_API_URL}/mercadopago/reconcile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  }).then(async (response) => {
    const body = await response.json() as ReconcileResult;
    if (!response.ok) throw new Error(body.message || "No fue posible confirmar el pago");
    return body;
  }).catch((error) => {
    reconciliationRequests.delete(paymentId);
    throw error;
  });
  reconciliationRequests.set(paymentId, request);
  return request;
}

export default function PaymentResultPage() {
  const { clearCart } = useCart();
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Confirmando tu pago…");
  const [confirmed, setConfirmed] = useState(false);
  const paymentId = params.get("payment_id") || params.get("collection_id");
  const status = params.get("status");

  useEffect(() => {
    if (!paymentId) {
      setMessage(status === "pending" ? "Tu pago está pendiente." : "No recibimos el identificador del pago.");
      return;
    }
    reconcilePayment(paymentId).then((body) => {
      // El carrito se conserva durante todo el checkout para que el cliente
      // pueda reintentar si cancela, falla o deja pendiente el pago. Sólo una
      // conciliación aprobada por el servidor autoriza vaciarlo.
      clearCart();
      setConfirmed(true);
      setMessage(`Pago confirmado. Pedido ${formatFolio(body.saleId)}.`);
    }).catch((error) => setMessage(error instanceof Error ? error.message : "No fue posible confirmar el pago"));
  }, [paymentId, status]);

  return <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 text-center">
    <section className="w-full rounded-3xl bg-white p-10 shadow-lg">
      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${confirmed ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"}`}>
        {confirmed ? "✓" : "…"}
      </div>
      <h1 className="text-3xl font-extrabold text-primary">Resultado del pago</h1>
      <p className="mt-4 text-lg text-gray-700">{message}</p>
      <Link to="/" className="mt-8 inline-block rounded-full bg-primary px-8 py-4 font-bold text-white">Volver a la tienda</Link>
    </section>
  </main>;
}

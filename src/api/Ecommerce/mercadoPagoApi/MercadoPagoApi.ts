export interface CheckoutItem { ID_Product: number; ID_Stock: number; Quantity: number }
export interface CheckoutRequest {
  name: string; email: string; phone: string; address: string;
  items: CheckoutItem[];
}

export async function createCheckout(datos: CheckoutRequest): Promise<{
  saleId: number; checkoutUrl: string;
}> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/mercadopago/checkout`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "No fue posible crear el pedido");
  return body;
}

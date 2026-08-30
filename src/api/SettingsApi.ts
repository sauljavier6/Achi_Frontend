export type ShippingSettings = { enabled: boolean; amount: number; taxRate: number; productCode: string; description: string };
const base = `${import.meta.env.VITE_API_URL}/settings`;
export async function getPublicShippingSettings(): Promise<ShippingSettings> {
  const response = await fetch(`${base}/public/shipping`); if (!response.ok) throw new Error("No fue posible consultar el envío"); return response.json();
}
export async function getShippingSettings(): Promise<ShippingSettings> {
  const response = await fetch(`${base}/shipping`, { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
  const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message || "No fue posible consultar la configuración"); return body;
}
export async function updateShippingSettings(data: ShippingSettings): Promise<ShippingSettings> {
  const response = await fetch(`${base}/shipping`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` }, body: JSON.stringify(data) });
  const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message || "No fue posible guardar la configuración"); return body;
}

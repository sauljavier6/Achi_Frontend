import { idempotencyKey } from '../../../utils/idempotency';
const token = { toString: () => localStorage.getItem('token') || '' }

interface Iva {
  Description: string;
  Iva: number;
}

interface Product {
  Description: string;
  Code: string;
  Iva: Iva;
}

interface Stock {
  Description: string;
  Code: string;
  Purchaseprice: number;
  Saleprice: number;
}

interface Item {
  ID_Product?: number;
  Quantity: number;
  Product: Product;
  Stock: Stock;
}

interface datafactura {
  ID_Sale: number,
  RFC: string,
  RazonSocial: string,
  CodigoPostal: string,
  RegimenFiscal: string,
  UsoCFDI: string,
  FormaPago: string,
  MetodoPago: string,
  Subtotal: number,
  Iva: number,
  Total: number,
  Items: Item[]
}

export const postFactura = async ( datafacturacion : datafactura) => {
  console.log("Data enviada para facturación:", datafacturacion);
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Idempotency-Key': idempotencyKey('invoice', datafacturacion)
    },
    body: JSON.stringify(datafacturacion)
  });

  console.log("HTTP status:", res.status);

  const data = await res.json(); // 👈 leer una sola vez

  if (!res.ok) {
    throw new Error(data.message || 'Error al enviar la solicitud de facturación');
  }

  console.log("Respuesta del timbrado:", data);
  return data;
};


export const getFacturas = async ({ page = 1, limit = 10, searchTerm='', status='' }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), searchTerm, status });
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error('Error al obtener facturas');
  return await res.json();
};

export const getFacturacionSaleById = async (ID_Sale: number | null) => {
  if (ID_Sale == null) throw new Error("ID_Sale is required");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion/sale/${ID_Sale}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener venta");
  }

  const result = await res.json();
  return result.data;
};


export const downloadFacturaPDF = async (uuid: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/facturacion/factura/pdf/${uuid}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Error al descargar PDF");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `factura-${uuid}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};

export const validateFactura = async (datafacturacion: datafactura) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(datafacturacion),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "No fue posible validar la factura");
  return body as { ready: boolean; issues: string[]; warnings: string[]; checks: { key: string; label: string; ok: boolean }[] };
};

export const sendFacturaEmail = async (uuid: string, email: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion/factura/${uuid}/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "No fue posible enviar la factura");
  return body;
};

export const cancelFactura = async (uuid: string, motive: string, replacementUuid?: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion/factura/${uuid}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Idempotency-Key": idempotencyKey('invoice-cancel', { uuid, motive, replacementUuid }) },
    body: JSON.stringify({ motive, replacementUuid: replacementUuid || undefined }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "No fue posible solicitar la cancelación");
  return body;
};

export const downloadFacturaAcuse = async (uuid: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion/factura/${uuid}/acuse`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "No fue posible descargar el acuse");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `acuse-cancelacion-${uuid}.pdf`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
};

export const downloadFacturaXML = async (uuid: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion/factura/xml/${uuid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Error al descargar XML");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `factura-${uuid}.xml`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const cfdiRequest = async (path: string, init?: RequestInit) => {
  const mutationHeaders: Record<string, string> = init?.method && init.method !== "GET" ? { "Idempotency-Key": idempotencyKey(`cfdi-${path}`, init.body || {}) } : {};
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion${path}`, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...mutationHeaders, ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "No fue posible completar la operación fiscal");
  return body;
};

export const previewGlobalInvoice = (from: string, to: string) => cfdiRequest(`/global/preview?${new URLSearchParams({ from, to })}`);
export const issueGlobalInvoice = (data: { from: string; to: string; periodicity: string; months: string; year: number }) => cfdiRequest("/global", { method: "POST", body: JSON.stringify(data) });
export const invoiceSaleFromGlobal = (id: number, receiver: Record<string, unknown>) => cfdiRequest(`/global/sale/${id}/invoice`, { method: "POST", body: JSON.stringify(receiver) });
export const getPendingComplements = () => cfdiRequest("/complements/pending");
export const issuePaymentComplement = (id: number) => cfdiRequest(`/complements/${id}`, { method: "POST" });
export const replaceFactura = (uuid: string, receiver: Record<string, unknown>) => cfdiRequest(`/factura/${uuid}/replace`, { method: "POST", body: JSON.stringify(receiver) });

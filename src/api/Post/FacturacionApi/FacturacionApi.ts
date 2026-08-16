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
      'Authorization': `Bearer ${token}`
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


export const getFacturas = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/facturacion?page=${page}&limit=${limit}&searchTerm=${searchTerm}`, {
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

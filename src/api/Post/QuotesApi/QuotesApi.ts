const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
});

const getErrorMessage = async (res: Response, fallback: string) => {
  try {
    const error = await res.json();
    return error.message || fallback;
  } catch {
    return fallback;
  }
};

interface SaleItem {
  productId: number;
  stockId: number;
  quantity: number;
  price: number;
  subtotal: number;
}

interface SaleData {
  ID_User: number;
  Total: number;
  Balance_Total: number;
  Subtotal: number;
  Iva: number;
  ID_State: number;
  ID_Operador: number;
  Lote: string;
  items: SaleItem[];
}

interface SaleDataWithID extends SaleData {
  ID_Sale?: number;
}


export const getQuotes = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), searchTerm });
  const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes?${params}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Error al obtener cotizaciones'));
  }

  return await res.json();
};

export const postQuote = async (saleData:SaleData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(saleData),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Error al crear la cotización'));
  }

  return await res.json();
};

export const getQuoteById = async (ID_Sale: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes/${ID_Sale}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Error al obtener la cotización'));
  }

  return await res.json();
};


export const updateQuote = async (saleData:SaleDataWithID) => {
   const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes/${saleData.ID_Sale}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(saleData),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Error al actualizar la cotización'));
  }

  return await res.json();
};

export const searchQuotesForCheckout = async (query: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes/checkout/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Error al buscar cotizaciones'));
  return await res.json();
};

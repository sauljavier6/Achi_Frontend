const token = localStorage.getItem('token')

interface SaleItem {
  productId: number;
  stockId: number;
  quantity: number;
  price: number;
  subtotal: number;
}

interface PaymentSale {
  ID_Payment: number;
  Description: string;
  Monto: number;
  ReferenceNumber: string;
}

interface SaleData {
  ID_User: number;
  Total: number;
  Balance_Total: number;
  Subtotal: number;
  Iva: number;
  ID_State: number;
  Payment: PaymentSale[];
  ID_Operador: number;
  Lote: string;
  items: SaleItem[];
}

interface SaleDataWithID extends SaleData {
  ID_Sale?: number;
}


export const getQuotes = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes?page=${page}&limit=${limit}&searchTerm=${searchTerm}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener cotización');
  }

  return await res.json();
};

export const postQuote = async (saleData:SaleData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(saleData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear venta');
  }

  return await res.json();
};

export const getQuoteById = async (ID_Sale: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes/${ID_Sale}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener la venta');
  }

  return await res.json();
};


export const updateQuote = async (saleData:SaleDataWithID) => {
   const res = await fetch(`${import.meta.env.VITE_API_URL}/quotes/${saleData.ID_Sale}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(saleData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar la venta');
  }

  return await res.json();
};
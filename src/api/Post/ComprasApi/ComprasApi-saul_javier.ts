const token = localStorage.getItem('token')

interface Payment {
  ID_Payment: number;
  Description: string;
  Monto: number;
  ReferenceNumber: string;
}

interface Product {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  saleprice: number;
  purchaseprice: number;
  amount?: number;
  variant?: string;
}

interface buyData {
  ID_Proveedor: number | null;
  Total: number;
  Balance_Total: number;
  ID_Operador: string | null;

  Payments: Payment[];
  items: Product[];
}


export const postCompra = async (saleData:buyData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/compras`, {
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


export const getCompras = async ({ page = 1, limit = 10 }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/compras?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener compras');
  }

  return await res.json();
};


export const deleteCompras = async (ids: number[]) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/compras`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar compra');
  }

  return await res.json();
};
const token = localStorage.getItem('token')

interface SaleItem {
  productId: number;
  stockId: number;
  quantity: number;
  price: number;
  subtotal: number;
}

interface User {
  email: string;
  name: string;
  phone: string;
}

interface SaleData {
  User: User;
  Total: number;
  items: SaleItem[];
}

export const postQuote = async (saleData:SaleData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/quotes`, {
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

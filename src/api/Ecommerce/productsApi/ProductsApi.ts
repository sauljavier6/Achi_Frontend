const token = localStorage.getItem('token')

export const getProductsCatalogoBanner = async ({ page = 1, limit = 10 }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/products?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
};

export const getProductsBestProduct = async ({ page = 1, limit = 10 }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/products?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error('Error al obtener productos');
  return await res.json();
};

export const getProductsCatalog = async ({
  page = 1,
  limit = 10,
  category,
  minPrice,
  maxPrice,
  sortBy,
}: {
  page?: number;
  limit?: number;
  category?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sortBy?: string | null;
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  console.log('category',category)

  if (category) params.append("category", String(category));
  if (minPrice) params.append("minPrice", String(minPrice));
  if (maxPrice) params.append("maxPrice", String(maxPrice));
  if (sortBy) params.append("sortBy", sortBy);

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ecommerce/products/catalogo?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Error al obtener productos");
  return await res.json();
};



export const getProductById = async (id: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/products/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el producto');
  }

  return await res.json();
};


export const getProductsByDescription = async (description: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/products/searchproduct/${description}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el producto');
  }

  return await res.json();
};
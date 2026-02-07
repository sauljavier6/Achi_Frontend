const token = localStorage.getItem('token');

export const getCategory = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener los estados');
  }

  return await res.json();
};



interface CategoryPayload {
  Description: string;
  Genero: string;
}

export const postCategory = async (data: CategoryPayload) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ecommerce/categories`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear categoría');
  }

  return await res.json();
};

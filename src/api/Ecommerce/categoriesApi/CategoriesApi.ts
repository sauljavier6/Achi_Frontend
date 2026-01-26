
export const getCategory = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener las categorias');
  }

  return await res.json();
};

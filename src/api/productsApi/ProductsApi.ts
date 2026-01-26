const token = localStorage.getItem('token')

export const getProducts = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/product`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error('Error al obtener products');
  return await res.json();
};

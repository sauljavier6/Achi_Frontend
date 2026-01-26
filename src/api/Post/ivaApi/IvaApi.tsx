const token = localStorage.getItem('token')

export const getIvaDatos = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/iva`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener cliente');
  }

  return await res.json();
};

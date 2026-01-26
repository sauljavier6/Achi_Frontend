const token = localStorage.getItem('token')

export const getPayments = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/payment`, {
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

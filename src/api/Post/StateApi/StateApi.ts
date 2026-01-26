const token = localStorage.getItem('token')

export const getStates = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/state`, {
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

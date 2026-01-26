const token = localStorage.getItem('token')

interface Rol {  
    description: string;
    state: boolean;
}

export const getRoles = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/rol`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) throw new Error('Error al obtener los roles');
  return await res.json();
};


export const registerRol = async (rolData: Rol) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/rol`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(rolData),
  });
  if (!res.ok) throw new Error('Error al registrar usuario');
  return await res.json();
};

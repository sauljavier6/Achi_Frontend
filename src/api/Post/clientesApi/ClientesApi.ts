const token = localStorage.getItem('token')

export const getClientes = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/clientes?page=${page}&limit=${limit}&searchTerm=${searchTerm}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener los clientes');
  }

  return await res.json();
};

export const getCustomerSale = async (email: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/clientes/search?email=${email}`, {
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


export const getCustomerByID_User = async (ID_User: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/clientes/${ID_User}`, {
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

export const deleteMultipleCustomers = async (ids: number[]) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/clientes`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar clientes');
  }

  return await res.json();
};

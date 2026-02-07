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
    `${import.meta.env.VITE_API_URL}/category`,
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


export const getCategoryList = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/category?page=${page}&limit=${limit}&searchTerm=${searchTerm}`, {
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

export const getCategoryById = async (id: number) => {
  console.log('id dentro de api', id)
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/category/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener categoría");
  }

  return await res.json();
};

export const updateCategory = async ({ id, data }: any) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/category/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al actualizar categoría");
  }

  return await res.json();
};


export const deleteMultipleCategorys = async (ids: number[]) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/category`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar categoria');
  }

  return await res.json();
};
const token = { toString: () => localStorage.getItem('token') || '' };

export const getSubCategory = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ecommerce/subcategories`, {
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
 


interface SubCategoryPayload  {
  Description: string;
  State: boolean;
}

export const postSubCategory = async (data: SubCategoryPayload) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/subcategory`,
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


export const getSubCategoryList = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/subcategory?page=${page}&limit=${limit}&searchTerm=${searchTerm}`, {
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

export const getSubCategoryById = async (id: number) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/subcategory/${id}`,
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

export const updateSubCategory = async ({ id, data }: any) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/subcategory/${id}`,
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


export const deleteMultipleSubCategories = async (ids: number[]) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/subcategory`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar subcategoría');
  }

  return await res.json();
};

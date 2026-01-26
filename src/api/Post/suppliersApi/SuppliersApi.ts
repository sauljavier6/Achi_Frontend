const token = localStorage.getItem('token')

interface Suppliers { 
  Name: string;
  Email: string;
  Phone: string,
}

interface SuppliersWithId extends Suppliers {
  ID_User?: number;
}

export const CreateSupplier = async (SuppliersData:Suppliers) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/supplier`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(SuppliersData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear proveedor');
  }

  return await res.json();
};

export const getSuppliers = async ({ page = 1, limit = 10, searchTerm='' }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/supplier?page=${page}&limit=${limit}&searchTerm=${searchTerm}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener proveedores');
  }

  return await res.json();
};

export const deleteMultipleSuppliers = async (ids: number[]) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/supplier`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar proveedor');
  }

  return await res.json();
};

export const getSupplierById = async (id: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/supplier/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el proveedor');
  }

  return await res.json();
};

export const updateSupplier = async (supplierData: SuppliersWithId) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/supplier`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(supplierData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar el proveedor');
  }

  return await res.json();
};

export const getSupplier = async (email: string) => {
  console.log('correo',email)
  const res = await fetch(`${import.meta.env.VITE_API_URL}/supplier/search?email=${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener proveedor');
  }

  return await res.json();
};
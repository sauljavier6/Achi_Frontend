const token = localStorage.getItem('token');

export const getBatch = async (searchTerm='') => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/batch?searchTerm=${searchTerm}`, {
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


interface BatchData {
  id_batch?: number;
  operador: string | number;
  lote: string;
  fecha: string;
  estado?: boolean;
}


export const postBatch = async (data: BatchData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear el lote');
  }

  return await res.json();
};

export const putBatch = async (data: BatchData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/batch`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear el lote');
  }

  return await res.json();
};

export const getBatchbyIs = async (ID_Batch: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/batch/${ID_Batch}`, {
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
const token = { toString: () => localStorage.getItem('token') || '' };
import { idempotencyKey } from '../../../utils/idempotency';

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
  fondoInicial?: number;
}


export const postBatch = async (data: BatchData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
      ,'Idempotency-Key': idempotencyKey('cash.open', data)
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

export const getBatchSummary = async (ID_Batch: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/batch/${ID_Batch}/summary`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'No fue posible calcular el corte');
  return body.data;
};

export const closeBatch = async ({ ID_Batch, countedCash, notes }: { ID_Batch: number; countedCash: number; notes?: string }) => {
  const payload = { countedCash, notes };
  const res = await fetch(`${import.meta.env.VITE_API_URL}/batch/${ID_Batch}/close`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Idempotency-Key': idempotencyKey(`cash.close.${ID_Batch}`, payload),
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'No fue posible cerrar la caja');
  return body;
};

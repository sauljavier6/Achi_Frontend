const token = localStorage.getItem('token')

export interface IRetiroForm {
  Description: string;
  Amount: string;
  Payment: string;
  Batch: string;
  ID_Operador: string | null;
}

export const createRetiro = async (data: IRetiroForm) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/retiro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al enviar ticket');
  }

  return await res.json();
};

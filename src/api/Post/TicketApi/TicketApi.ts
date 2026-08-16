const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}` });

export const openTicket = async (idSale: number, quotation = false) => {
  const path = quotation ? `ticket/cotizacion/${idSale}` : `ticket/${idSale}`;
  const res = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, { headers: authHeader() });
  if (!res.ok) throw new Error('No fue posible obtener el ticket');
  const url = URL.createObjectURL(await res.blob());
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};


export const sendTicket = async (id: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ticket/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al enviar ticket');
  }

  return await res.json();
};


export const sendCotizacion = async (id: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ticket/cotizacion/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al enviar ticket');
  }

  return await res.json();
};

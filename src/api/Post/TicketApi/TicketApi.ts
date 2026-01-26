const token = localStorage.getItem('token')

export const getTicket = (idSale: number) => {
  return `${import.meta.env.VITE_API_URL}/ticket/${idSale}?token=${token}`;
};

export const getTicketCotizacion = (idSale: number) => {
  return `${import.meta.env.VITE_API_URL}/ticket/${idSale}?token=${token}`;
};


export const sendTicket = async (id: number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/ticket/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al enviar ticket');
  }

  return await res.json();
};
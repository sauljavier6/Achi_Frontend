const token = localStorage.getItem('token')

export const getDatos = async (Lote: string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/information?lote=${Lote}`, {
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

export const getCorteCaja = async (Lote: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/information/corte?lote=${Lote}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Error al descargar PDF");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `CorteCaja-${Lote}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};

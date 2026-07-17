export const payment = async (datos: unknown) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datos }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al crear pago");
  }

  return data;
};

export const Savesale = async (datos: unknown) => {
  console.log("Guardando venta con datos:", datos);
  const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/savesales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datos }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al guardar la venta");
  }

  return data;
};

interface UpdateSaleProps {
  saleId: number;
  paymentId: string;
  items: any[];
  total: number;
}

export const updateSale = async ({
  saleId,
  paymentId,
  items,
  total,
}: UpdateSaleProps) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/stripe/updatesalestatus`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        saleId,
        paymentId,
        items,
        total,
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar la venta");
  }

  return data;
};

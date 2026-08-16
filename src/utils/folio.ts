export const formatFolio = (id: number | string | null | undefined) => String(id ?? "").padStart(6, "0");

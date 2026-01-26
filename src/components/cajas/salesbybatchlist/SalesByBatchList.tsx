import React from "react";
import { getDatos } from "../../../api/Post/InformationApi/InformationApi";
import { useQuery } from "@tanstack/react-query";

interface CajasProps {
  Lote: string;
}

const SalesByBatchList = ({ Lote }: CajasProps) => {
  
  const { data: information } = useQuery({
    queryKey: ['information', Lote],
    queryFn: () => getDatos(Lote),
    enabled: !!Lote,
  });

  // Transformar los datos al formato de la tabla
  const combinedData = React.useMemo(() => {
    if (!information?.data) return [];

    return information?.data
      .map((item: any) => {
        if ("ID_Sale" in item) {
          return {
            tipoRegistro: "Venta",
            total: item.Total,
            balance: item.Balance_Total,
            fechaHora: item.createdAt,
            tipo: "Venta",
          };
        } else if ("ID_Retiro" in item) {
          return {
            tipoRegistro: "Retiro",
            total: item.Amount,
            balance: "-",
            fechaHora: item.createdAt,
            tipo: "retiro",
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort(
        (a: any, b: any) =>
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
      );
  }, [information]);

  return (
    <div className="overflow-x-auto border rounded-md shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-2 py-2">Tipo</th>
            <th className="px-2 py-2">Total</th>
            <th className="px-2 py-2">Balance</th>
            <th className="px-2 py-2">Fecha y hora</th>
          </tr>
        </thead>
        <tbody>
          {combinedData?.map((row:any, index:any) => (
            <tr key={index} className="border-t">
              <td className="px-2 py-2">{row.tipoRegistro}</td>
              <td className="px-2 py-2">${row.total}</td>
              <td className="px-2 py-2">{row.balance}</td>
              <td className="px-2 py-2">
                {new Date(row.fechaHora).toLocaleString('es-MX', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesByBatchList;

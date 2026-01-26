import { useQuery } from "@tanstack/react-query";
import { getSaleWeb } from "../../../api/Post/SaleApi/SaleApi";
import { useEffect, useState } from "react";

export interface ISale {
  ID_Sale: number;
  Name: string;
}

export interface ISale {
  operator: ISale;
  user: ISale;
  ID_Sale: number;
  ID_User?: number;
  Total: number;
  Balance_Total: number;
  ID_State: number;
  State?: boolean;
  StateWeb?: boolean;
  ID_Operador: number;
  Batch: string;
  createdAt: string
}

interface SaleListProps {
  onSelected: (ids: number[]) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}

const SalesWebList = ({onSelected, resetChecks, onResetComplete, searchTerm }:SaleListProps ) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ['sales', page, limit, searchTerm],
    queryFn: () => getSaleWeb({ page, limit, searchTerm }),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (resetChecks) {
      setSelectedIds([]);
      onSelected([]);
      onResetComplete(); 
    }
  }, [resetChecks]);

  useEffect(() => {
    onSelected(selectedIds);
  }, [selectedIds]);

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!data?.data) return;

    if (selectedIds.length === data.data.length) {
      setSelectedIds([]); // deselecciona todo
    } else {
      const allIds = data.data.map((prod: ISale) => prod.ID_Sale);
      setSelectedIds(allIds); // selecciona todo
    }
  };

  return (
    <>
    <div className="overflow-x-auto border rounded-md shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-2 py-2">
              <input
              type="checkbox"
              checked={selectedIds.length === data?.data?.length && data?.data?.length > 0}
              onChange={handleSelectAll}
              />
            </th>
            <th className="px-2 py-2">Numero Venta</th>
            <th className="px-2 py-2">Cliente</th>
            <th className="px-2 py-2">Total</th>
            <th className="px-2 py-2">Fecha</th>
            <th className="px-2 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((prod:ISale) => (
            <tr key={prod.ID_Sale} className="border-t">
              <td className="px-2 py-2">
                <input type="checkbox" checked={selectedIds.includes(prod.ID_Sale)}
                  onChange={() => handleCheckboxChange(prod.ID_Sale)}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="px-2 py-2">{prod.ID_Sale}</td>
              <td className="px-2 py-2">{prod.ID_User? prod.user.Name: "Cliente no asignado"}</td>
              <td className="px-2 py-2">{prod.Total}</td>
                            <td className="px-5 py-2">{(() => {
                const d = new Date(prod.createdAt);
                const day = d.getDate().toString().padStart(2, '0');
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
              })()}
              </td>
              <td className="px-2 py-2">{prod.StateWeb? 'Pendiente': 'Completada'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex justify-end items-center mt-4 space-x-2">
      <button
        disabled={page === 1}
        onClick={() => setPage((old) => Math.max(old - 1, 1))}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center justify-center"
      >
        <img src="/icons/flecha-negra.png" alt="Anterior" className="w-4 h-4" />
      </button>

      {data && data.totalPages >= 1 && (
        <>
          {(() => {
            const maxButtons = 5;
            let start = Math.max(1, page - Math.floor(maxButtons / 2));
            let end = start + maxButtons - 1;

            if (end > data.totalPages) {
              end = data.totalPages;
              start = Math.max(1, end - maxButtons + 1);
            }

            return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1 rounded ${
                  page === num
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {num}
              </button>
            ));
          })()}
        </> 
      )}

      <button
        disabled={page >= (data?.totalPages || 1)}
        onClick={() => setPage((old) => old + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center justify-center"
      >
        <img src="/icons/flecha-negra.png" alt="Siguiente" className="w-4 h-4 rotate-180" />
      </button>
    </div>
    </>
  );
};

export default SalesWebList;

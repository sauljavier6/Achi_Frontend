import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getCompras } from "../../../../api/Post/ComprasApi/ComprasApi";


interface Proveedor {
  ID_Proveedor: number;
  Name: string;
} 

interface Operador {
  ID_Operador: number;
  Name: string;
} 

interface Compras { 
  ID_Compras: number;
  Proveedor: Proveedor;
  Total: number;
  Balance_Total: number,
  Operador:  Operador,
  createdAt: string,
}

interface ComprasProps { 
  onDelete: (ids: number[]) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}

const ComprasList = ({ onDelete, resetChecks, onResetComplete, searchTerm }: ComprasProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ['compras', page, limit, searchTerm],
    queryFn: () => getCompras({ page, limit, searchTerm }),
    placeholderData: (prev) => prev,
  });

  console.log('data', data);

  useEffect(() => {
    if (resetChecks) { 
      setSelectedIds([]);
      onDelete([]);
      onResetComplete(); 
    }
  }, [resetChecks]);

  useEffect(() => {
    onDelete(selectedIds);
  }, [selectedIds]);


  const handleCheckboxChange = (ID_Compras: number) => {
    setSelectedIds((prov) =>
      prov.includes(ID_Compras)
        ? prov.filter((item) => item !== ID_Compras)
        : [...prov, ID_Compras]
    );
  };

  const handleSelectAll = () => {
    if (!data?.data) return;

    if (selectedIds.length === data.data.length) {
      setSelectedIds([]);
    } else {
      const allIds = data.data.map((prov: Compras) => prov.ID_Compras);
      setSelectedIds(allIds);
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
            <th className="px-5 py-2">Compra</th>
            <th className="px-5 py-2">Proveedor</th>
            <th className="px-5 py-2">Total</th>
            <th className="px-5 py-2">Balance Total</th>
            <th className="px-5 py-2">Operador</th>
            <th className="px-5 py-2">Fecha</th>

          </tr>
        </thead>
        <tbody>
          {data?.data?.map((comp: Compras) => (
            <tr key={comp.ID_Compras} className="border-t">
              <td className="px-2 py-2">
                <input type="checkbox" checked={selectedIds.includes(comp.ID_Compras)}
                onChange={() => handleCheckboxChange(comp.ID_Compras)}
                onClick={(e) => e.stopPropagation()}/>
              </td>
              <td className="px-5 py-2">{comp.ID_Compras}</td>
              <td className="px-5 py-2">{comp.Proveedor?.Name}</td>
              <td className="px-5 py-2">${comp.Total}</td>
              <td className="px-5 py-2">${comp.Balance_Total}</td>
              <td className="px-5 py-2">{comp.Operador?.Name}</td>
              <td className="px-5 py-2">{(() => {
                const d = new Date(comp.createdAt);
                const day = d.getDate().toString().padStart(2, '0');
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
              })()}
              </td>
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

export default ComprasList;

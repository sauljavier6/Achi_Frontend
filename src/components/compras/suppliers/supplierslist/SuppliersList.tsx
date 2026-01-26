import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSuppliers } from "../../../../api/Post/suppliersApi/SuppliersApi";

interface ModalSuppliersProps { 
  onDelete: (ids: number[]) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}

interface SuppliersEmail { 
  ID_Email: number;
  Description: string;
}

interface SuppliersPhone { 
  ID_Phone: number;
  Description: string;
}

interface Suppliers { 
  ID_User: number;
  Name: string;
  Email: SuppliersEmail;
  Phone: SuppliersPhone,
}

const SuppliersList = ({ onDelete, resetChecks, onResetComplete, searchTerm }: ModalSuppliersProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ['suppliers', page, limit, searchTerm],
    queryFn: () => getSuppliers({ page, limit, searchTerm }),
    placeholderData: (prev) => prev,
  });
  
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

  const handleCheckboxChange = (ID_User: number) => {
    setSelectedIds((prov) =>
      prov.includes(ID_User)
        ? prov.filter((item) => item !== ID_User)
        : [...prov, ID_User]
    );
  };

  const handleSelectAll = () => {
    if (!data?.data) return;

    if (selectedIds.length === data.data.length) {
      setSelectedIds([]);
    } else {
      const allIds = data.data.map((prov: Suppliers) => prov.ID_User);
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
            <th className="px-2 py-2">ID Proveedor</th>
            <th className="px-2 py-2">Nombre</th>
            <th className="px-2 py-2">Correo</th>
            <th className="px-2 py-2">Telefono</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((prov:Suppliers) => (
            <tr key={prov.ID_User} className="border-t">
                <td className="px-2 py-2">
                  <input type="checkbox" checked={selectedIds.includes(prov.ID_User)}
                  onChange={() => handleCheckboxChange(prov.ID_User)}
                  onClick={(e) => e.stopPropagation()}/>
                </td>
              <td className="px-2 py-2">{prov.ID_User}</td>
              <td className="px-2 py-2">{prov.Name}</td>
              <td className="px-2 py-2">{prov.Email?.Description}</td>
              <td className="px-2 py-2">{prov.Phone?.Description}</td>
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

export default SuppliersList;

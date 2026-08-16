import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { getSubCategoryList } from "../../../api/Post/SubCategoryApi/SubCategoryApi";

export interface SubCategoryProps {
  ID_SubCategory: number;
  Description: string;
  State: boolean;
}

interface SubCategoryListProps {
  onDelete: (ids: number[]) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}

const SubCategoryList = ({onDelete, resetChecks, onResetComplete, searchTerm}: SubCategoryListProps ) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ['subcategory', page, limit, searchTerm],
    queryFn: () => getSubCategoryList({ page, limit, searchTerm }),
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
      setSelectedIds([]);
    } else {
      const allIds = data.data.map((prod: SubCategoryProps) => prod.ID_SubCategory);
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
            <th className="px-2 py-2">ID</th>
            <th className="px-2 py-2">Descripción</th>
            <th className="px-2 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>

            {data?.data?.map((prod: SubCategoryProps) => (
              <tr key={prod.ID_SubCategory} className="border-t">
                <td className="px-2 py-2">
                  <input type="checkbox" checked={selectedIds.includes(prod.ID_SubCategory)}
                  onChange={() => handleCheckboxChange(prod.ID_SubCategory)}
                  onClick={(e) => e.stopPropagation()}/>
                </td>
                <td className="px-2 py-2">{prod.ID_SubCategory}</td>
                <td className="px-2 py-2">{prod.Description}</td>
                <td className="px-2 py-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${prod.State ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {prod.State ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))
          }
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
                    ? "bg-[#c70063] text-white"
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
        <img src="/icons/flecha-negra.png" alt="Siguiente" className="w-4 h-4 transform rotate-180" />
      </button>
    </div>
    </>
  );
};

export default SubCategoryList;

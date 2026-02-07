import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { getCategoryList } from "../../../api/Post/CategoryApi/CategoryApi";

export interface CategoryProps {
  ID_Category: number;
  Description: string;
  Genero: string;
}

interface CategoryListProps {
  onDelete: (ids: number[]) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}

const CategoryList = ({onDelete, resetChecks, onResetComplete, searchTerm}: CategoryListProps ) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ['category', page, limit, searchTerm],
    queryFn: () => getCategoryList({ page, limit, searchTerm }),
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
      const allIds = data.data.map((prod: CategoryProps) => prod.ID_Category);
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
            <th className="px-2 py-2">Descripcion</th>
            <th className="px-2 py-2">Genero</th>
          </tr>
        </thead>
        <tbody>

            {data?.data?.map((prod: CategoryProps) => (
              <tr key={prod.ID_Category} className="border-t">
                <td className="px-2 py-2">
                  <input type="checkbox" checked={selectedIds.includes(prod.ID_Category)}
                  onChange={() => handleCheckboxChange(prod.ID_Category)}
                  onClick={(e) => e.stopPropagation()}/>
                </td>
                <td className="px-2 py-2">{prod.ID_Category}</td>
                <td className="px-2 py-2">{prod.Description}</td>
                <td className="px-2 py-2">{prod.Genero}</td>
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
        <img src="/icons/flecha-negra.png" alt="Siguiente" className="w-4 h-4 transform rotate-180" />
      </button>
    </div>
    </>
  );
};

export default CategoryList;

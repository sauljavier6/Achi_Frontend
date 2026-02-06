import { useEffect, useState } from "react";
import { getProducts } from "../../../api/Post/ProductApi/ProductApi";
import { useQuery } from '@tanstack/react-query';

export interface StockVariant {
  ID_Stock: number;
  ID_Product: number;
  Description: string;
  Amount: number;
  Saleprice: number;
  Purchaseprice: number;
  State: boolean;
}

export interface ProductProps {
  ID_Product: number;
  Description: string;
  Code: string;
  Imagen: string;

  ID_Category: number;
  Category?: {
    ID_Category: number;
    Description: string;
  };

  Stock?: StockVariant[];
}


interface ProductsListProps {
  onDelete: (ids: number[]) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}


const ProductsList = ({onDelete, resetChecks, onResetComplete, searchTerm}: ProductsListProps ) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ['products', page, limit, searchTerm],
    queryFn: () => getProducts({ page, limit, searchTerm }),
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
      const allIds = data.data.map((prod: ProductProps) => prod.ID_Product);
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
            <th className="px-2 py-2">Nombre</th>
            <th className="px-2 py-2">Categoria</th>
            <th className="px-2 py-2">Codigo</th>
            <th className="px-2 py-2">Precio venta</th>
            <th className="px-2 py-2">Precio compra</th>
          </tr>
        </thead>
        <tbody>

            {data?.data?.map((prod: ProductProps) => (
              <tr key={prod.ID_Product} className="border-t">
                <td className="px-2 py-2">
                  <input type="checkbox" checked={selectedIds.includes(prod.ID_Product)}
                  onChange={() => handleCheckboxChange(prod.ID_Product)}
                  onClick={(e) => e.stopPropagation()}/>
                </td>
                <td className="px-2 py-2">{prod.ID_Product}</td>
                <td className="px-2 py-2">{prod.Description}</td>
                <td className="px-2 py-2">{prod.Category?.Description}</td>
                <td className="px-2 py-2">{prod.Code}</td>
                <td className="px-2 py-2">${prod.Stock?.[0]?.Saleprice ?? '—'}</td>
                <td className="px-2 py-2">${prod.Stock?.[0]?.Purchaseprice ?? '—'}</td>
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

export default ProductsList;

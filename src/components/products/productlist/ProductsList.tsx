import { useEffect, useState } from "react";
import { getProducts } from "../../../api/Post/ProductApi/ProductApi";
import { useQuery } from "@tanstack/react-query";

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
  State: boolean;
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

const ProductsList = ({ onDelete, resetChecks, onResetComplete, searchTerm }: ProductsListProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ["products", page, limit, searchTerm],
    queryFn: () => getProducts({ page, limit, searchTerm }),
    placeholderData: (previous) => previous,
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
    setSelectedIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  };

  const handleSelectAll = () => {
    if (!data?.data) return;
    if (selectedIds.length === data.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.data.map((product: ProductProps) => product.ID_Product));
    }
  };

  return <>
    <div className="overflow-x-auto rounded-md border shadow-sm">
      <table className="min-w-[920px] w-full text-left text-sm">
        <thead className="bg-gray-100 uppercase text-gray-700">
          <tr>
            <th className="px-2 py-2"><input aria-label="Seleccionar todos los productos" type="checkbox" checked={selectedIds.length === data?.data?.length && data?.data?.length > 0} onChange={handleSelectAll} /></th>
            <th className="px-2 py-2">ID</th>
            <th className="px-2 py-2">Nombre</th>
            <th className="px-2 py-2">Categoría</th>
            <th className="px-2 py-2">Código</th>
            <th className="px-2 py-2">Precio venta</th>
            <th className="px-2 py-2">Precio compra</th>
            <th className="px-2 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((product: ProductProps) => <tr key={product.ID_Product} className="border-t">
            <td className="px-2 py-2"><input aria-label={`Seleccionar ${product.Description}`} type="checkbox" checked={selectedIds.includes(product.ID_Product)} onChange={() => handleCheckboxChange(product.ID_Product)} onClick={(event) => event.stopPropagation()} /></td>
            <td className="px-2 py-2">{product.ID_Product}</td>
            <td className="px-2 py-2">{product.Description}</td>
            <td className="px-2 py-2">{product.Category?.Description}</td>
            <td className="px-2 py-2">{product.Code}</td>
            <td className="px-2 py-2">${product.Stock?.[0]?.Saleprice ?? "—"}</td>
            <td className="px-2 py-2">${product.Stock?.[0]?.Purchaseprice ?? "—"}</td>
            <td className="px-2 py-2"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${product.State ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{product.State ? "Activo" : "Inactivo"}</span></td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <div className="mt-4 flex items-center justify-end space-x-2">
      <button disabled={page === 1} onClick={() => setPage((current) => Math.max(current - 1, 1))} className="flex items-center justify-center rounded bg-gray-200 px-3 py-1 disabled:opacity-50"><img src="/icons/flecha-negra.png" alt="Anterior" className="h-4 w-4" /></button>
      {data && data.totalPages >= 1 && (() => {
        const maxButtons = 5;
        let start = Math.max(1, page - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;
        if (end > data.totalPages) {
          end = data.totalPages;
          start = Math.max(1, end - maxButtons + 1);
        }
        return Array.from({ length: end - start + 1 }, (_, index) => start + index).map((number) => <button key={number} onClick={() => setPage(number)} className={`rounded px-3 py-1 ${page === number ? "bg-[#c70063] text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{number}</button>);
      })()}
      <button disabled={page >= (data?.totalPages || 1)} onClick={() => setPage((current) => current + 1)} className="flex items-center justify-center rounded bg-gray-200 px-3 py-1 disabled:opacity-50"><img src="/icons/flecha-negra.png" alt="Siguiente" className="h-4 w-4 rotate-180" /></button>
    </div>
  </>;
};

export default ProductsList;

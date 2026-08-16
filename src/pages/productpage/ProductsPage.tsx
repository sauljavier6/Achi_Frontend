
import { useState } from "react";
import ProductsList from "../../components/products/productlist/ProductsList";
import ModalProduct from "../../components/products/modalproduct/ModalProduct";
import { useMutation, useQueryClient  } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { deleteMultipleProducts } from "../../api/Post/ProductApi/ProductApi";
import { useAuth } from "../../hooks/useAuth";

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [productToEdit, setProductToEdit] = useState<number | null>(null);
  const [resetChecks, setResetChecks] = useState(false);

  const queryClient = useQueryClient();
  const { isAdmin, isTrabajador } = useAuth();

  const { mutate } = useMutation({
    mutationFn: deleteMultipleProducts,
    onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
    },
    onSuccess: () => {
        toast.success("Producto(s) eliminado(s) correctamente", {
        position: "top-right",
        progressClassName: "custom-progress",
        });
        queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateProduct = () => {
    setModalOpen(true);
    setSelectedIds([])
  };

  const handleDeleteProduct = () => {
    const label = selectedIds.length === 1 ? "este producto" : `estos ${selectedIds.length} productos`;
    if (!window.confirm(`¿Deseas eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    mutate(selectedIds);
    setSelectedIds([])
  };

  const handleEdit = () => {
    if (selectedIds.length === 1) {
      setProductToEdit(selectedIds[0]);
      setModalOpen(true);
    } else if (selectedIds.length > 1) {
      toast.warn('Solo puedes editar un producto a la vez');
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setProductToEdit(null);
    setResetChecks(true);
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div><p className="text-sm font-semibold text-[#c70063]">Catálogo</p><h1 className="text-2xl font-bold text-slate-900">Productos</h1><p className="text-sm text-slate-500">Administra precios, presentaciones e inventario.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o código"
            aria-label="Buscar productos"
            value={searchTerm}
            onChange={handleSearchChange}
            className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
          />
        {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateProduct}
            className="min-h-11 rounded-xl bg-[#c70063] px-4 py-2.5 font-bold text-white hover:bg-[#a90054]"
          >
            Nuevo producto
          </button>
        )}
        {(isAdmin || isTrabajador) && (
          <button
            onClick={handleEdit}
            disabled={selectedIds.length !== 1}
            className={`min-h-11 rounded-xl px-4 py-2.5 font-bold text-white transition-colors duration-200 
              ${selectedIds.length !== 1
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-[#007782] hover:bg-[#00636c]'}
            `}
          >
            Editar
          </button>
        )}
        {isAdmin && (
          <button
            onClick={handleDeleteProduct}
            disabled={selectedIds?.length === 0}
            className={`min-h-11 rounded-xl px-4 py-2.5 font-bold text-white transition-colors duration-200 
              ${selectedIds?.length === 0 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'border border-red-600 bg-red-600 hover:bg-red-700'}
            `}
          >
            Eliminar
          </button>
        )}
        </div>
      </div>

      <ProductsList onDelete={(id) => setSelectedIds(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>

      {modalOpen && (
        <ModalProduct onClose={handleClose}  onEdit={productToEdit} />
      )}
    </section>
  );
};

export default ProductsPage;

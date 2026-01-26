
import { useState } from "react";
import ProductsList from "../../components/products/productlist/ProductsList";
import styles from "./ProductsPage.module.scss";
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
        toast.success("Producto registrado con éxito", {
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
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h1 className={styles.title}>Productos</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
        {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateProduct}
            className={styles.buttonCrearProducto}
          >
            Crear
          </button>
        )}
        {(isAdmin || isTrabajador) && (
          <button
            onClick={handleEdit}
            disabled={selectedIds.length !== 1}
            className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200 
              ${selectedIds.length !== 1
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : styles.buttonEditarProducto}
            `}
          >
            Editar
          </button>
        )}
        {isAdmin && (
          <button
            onClick={handleDeleteProduct}
            disabled={selectedIds?.length === 0}
            className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200 
              ${selectedIds?.length === 0 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : styles.buttonEliminarProducto}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ModalProduct onClose={handleClose}  onEdit={productToEdit} />
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

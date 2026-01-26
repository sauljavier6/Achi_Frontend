
import { useState } from "react";
import styles from "./SuppliersPage.module.scss";
import SuppliersList from "../../components/compras/suppliers/supplierslist/SuppliersList";
import ModalSuppliers from "../../components/compras/suppliers/modalsuppliers/ModalSuppliers";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMultipleSuppliers } from "../../api/Post/suppliersApi/SuppliersApi";
import { useAuth } from "../../hooks/useAuth";

const SuppliersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [supplierToEdit, setSupplierToEdit] = useState<number | null>(null);
  const [resetChecks, setResetChecks] = useState(false);
  const { isAdmin, isTrabajador } = useAuth();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: deleteMultipleSuppliers,
    onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
    },
    onSuccess: () => {
        toast.success("Proveedor eliminado con éxito", {
        position: "top-right",
        progressClassName: "custom-progress",
        });
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateProveedor = () => {
    setModalOpen(true);
  };

  const handleDeleteProduct = () => {
    mutate(selectedIds);
    setSelectedIds([])
  };

  const handleEdit = () => {
    if (selectedIds.length === 1) {
      setSupplierToEdit(selectedIds[0]);
      setModalOpen(true);
    } else if (selectedIds.length > 1) {
      toast.warn('Solo puedes editar un producto a la vez');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h1 className={styles.title}>Proveedores</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateProveedor}
            className={styles.buttonCrearProducto}
          >
            Registrar
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

      {/* Pasamos el término de búsqueda al componente de la lista */}
      <SuppliersList onDelete={(id) => setSelectedIds(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm} />

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ModalSuppliers onClose={() => setModalOpen(false)} onEdit={supplierToEdit} />
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;

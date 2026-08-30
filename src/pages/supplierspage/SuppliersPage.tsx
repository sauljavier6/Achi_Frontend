
import { useState } from "react";
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
        toast.success("Proveedor(es) inactivado(s) sin alterar compras históricas", {
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
    setSupplierToEdit(null);
    setModalOpen(true);
  };

  const handleDeleteProduct = () => {
    const label = selectedIds.length === 1 ? "este proveedor" : `estos ${selectedIds.length} proveedores`;
    if (!window.confirm(`¿Deseas inactivar ${label}? Las compras históricas se conservarán.`)) return;
    mutate(selectedIds);
    setSelectedIds([])
  };

  const handleEdit = () => {
    if (selectedIds.length === 1) {
      setSupplierToEdit(selectedIds[0]);
      setModalOpen(true);
    } else if (selectedIds.length > 1) {
      toast.warn('Solo puedes editar un proveedor a la vez');
    }
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div><p className="text-sm font-semibold text-[#c70063]">Abastecimiento</p><h1 className="text-2xl font-bold text-slate-900">Proveedores</h1><p className="text-sm text-slate-500">Administra contactos y datos comerciales.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo"
            aria-label="Buscar proveedores"
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateProveedor}
            className="rounded-xl bg-[#c70063] px-4 py-2.5 font-semibold text-white hover:bg-[#a90054]"
          >
            Nuevo proveedor
          </button>
          )}
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleEdit}
            disabled={selectedIds.length !== 1}
            className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200 
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
            className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200 
              ${selectedIds?.length === 0 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'rounded-xl border border-red-600 bg-red-600 text-white hover:bg-red-700'}
            `}
          >
            Inactivar
          </button>
          )}
          
        </div>
      </div>

      {/* Pasamos el término de búsqueda al componente de la lista */}
      <SuppliersList onDelete={(id) => setSelectedIds(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm} />

      {modalOpen && (
        <ModalSuppliers key={supplierToEdit ? `edit-${supplierToEdit}` : "new"} onClose={() => { setModalOpen(false); setSupplierToEdit(null); }} onEdit={supplierToEdit} />
      )}
    </section>
  );
};

export default SuppliersPage;

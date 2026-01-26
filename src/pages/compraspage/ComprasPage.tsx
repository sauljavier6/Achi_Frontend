
import { useState } from "react";
import styles from "./ComprasPage.module.scss";
import ComprasList from "../../components/compras/comprasygastos/compraslist/ComprasList";
import Compras from "../../components/compras/comprasygastos/compras/Compras";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteCompras } from "../../api/Post/ComprasApi/ComprasApi";
import { useAuth } from "../../hooks/useAuth";

const ComprasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [resetChecks, setResetChecks] = useState(false);
  const { isAdmin, isTrabajador } = useAuth();

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: deleteCompras,
    onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
    },
    onSuccess: () => {
        toast.success("Compra eliminada con éxito", {
        position: "top-right",
        progressClassName: "custom-progress",
        });
        queryClient.invalidateQueries({ queryKey: ['compras'] });
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateCompra = () => {
    setFormOpen(true);
  };

  const handleDeleteProduct = () => {
    mutate(selectedIds);
    setSelectedIds([])
  };


  return (
    <div>
    {!formOpen && (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h1 className={styles.title}>Compras</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Buscar compra..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateCompra}
            className={styles.buttonCrearProducto}
          >
            Registrar compra
          </button>
          )}
          {(isAdmin || isTrabajador) && (
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

      
      <ComprasList onDelete={(id) => setSelectedIds(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>
    </div>
     )}

    {formOpen && (
      <div className="sm:p-4 bg-gray-50 rounded-lg">
        <div className="p-2 flex items-center justify-between mb-4">
          <button onClick={() => setFormOpen(false)} className="flex items-center gap-2 hover:text-blue-600">
            <img
              src="/icons/flecha.png"
              alt="flecha"
              className="w-5 h-5 transform rotate-180"
            />
            <span className="text-sm">Regresar</span>
          </button>
        </div>
        <Compras/>
      </div>
    )}
    </div>
  );
};

export default ComprasPage;

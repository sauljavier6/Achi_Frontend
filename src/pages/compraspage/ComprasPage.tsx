
import { useState } from "react";
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
        toast.success("Compra(s) eliminada(s) correctamente", {
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
    const label = selectedIds.length === 1 ? "esta compra" : `estas ${selectedIds.length} compras`;
    if (!window.confirm(`¿Deseas eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    mutate(selectedIds);
    setSelectedIds([])
  };


  return (
    <div>
    {!formOpen && (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div><p className="text-sm font-semibold text-[#c70063]">Abastecimiento</p><h1 className="text-2xl font-bold text-slate-900">Compras y gastos</h1><p className="text-sm text-slate-500">Registra entradas de mercancía y gastos operativos.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Buscar por folio o proveedor"
            aria-label="Buscar compras"
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateCompra}
            className="rounded-xl bg-[#c70063] px-4 py-2.5 font-semibold text-white hover:bg-[#a90054]"
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
                : 'rounded-xl border border-red-600 bg-red-600 text-white hover:bg-red-700'}
            `}
          >
            Eliminar
          </button>
          )}
        </div>
      </div>

      
      <ComprasList onDelete={(id) => setSelectedIds(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>
    </section>
     )}

    {formOpen && (
      <div className="rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
        <div className="p-2 flex items-center justify-between mb-4">
          <button onClick={() => setFormOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100">
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

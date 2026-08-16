
import { useState } from "react";
import { useMutation, useQueryClient  } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from "../../hooks/useAuth";
import { deleteMultipleSubCategories } from "../../api/Post/SubCategoryApi/SubCategoryApi";
import ModalSubCategory from "../../components/subcategory/modalsubcategory/ModalSubCategory";
import SubCategoryList from "../../components/subcategory/subcategorylist/SubCategoryList";

const CategoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [CategoryToEdit, setCategoryToEdit] = useState<number | null>(null);
  const [resetChecks, setResetChecks] = useState(false);

  const queryClient = useQueryClient();
  const { isAdmin, isTrabajador } = useAuth();

  const { mutate } = useMutation({
    mutationFn: deleteMultipleSubCategories,
    onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
    },
    onSuccess: () => {
        toast.success("Subcategoría(s) eliminada(s) correctamente", {
        position: "top-right",
        progressClassName: "custom-progress",
        });
        queryClient.invalidateQueries({ queryKey: ['subcategory'] });
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateCategory = () => {
    setModalOpen(true);
    setSelectedIds([])
  };

  const handleDeleteCategory = () => {
    const label = selectedIds.length === 1 ? "esta subcategoría" : `estas ${selectedIds.length} subcategorías`;
    if (!window.confirm(`¿Deseas eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    mutate(selectedIds);
    setSelectedIds([])
  };

  const handleEdit = () => {
    if (selectedIds.length === 1) {
      setCategoryToEdit(selectedIds[0]);
      setModalOpen(true);
    } else if (selectedIds.length > 1) {
      toast.warn('Solo puedes editar una subcategoría a la vez');
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setCategoryToEdit(null);
    setResetChecks(true);
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div><p className="text-sm font-semibold text-[#c70063]">Catálogo</p><h1 className="text-2xl font-bold text-slate-900">Subcategorías</h1><p className="text-sm text-slate-500">Crea divisiones más específicas para el catálogo.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Buscar subcategoría"
            aria-label="Buscar subcategorías"
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
        {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateCategory}
            className="min-h-11 rounded-xl bg-[#c70063] px-4 py-2.5 font-bold text-white hover:bg-[#a90054]"
          >
            Nueva subcategoría
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
            onClick={handleDeleteCategory}
            disabled={selectedIds?.length === 0}
            className={`min-h-11 rounded-xl px-4 py-2.5 font-bold text-white transition-colors duration-200 
              ${selectedIds?.length === 0 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'border border-red-600 bg-red-600 text-white hover:bg-red-700'}
            `}
          >
            Eliminar
          </button>
        )}
        </div>
      </div>

      <SubCategoryList onDelete={(id) => setSelectedIds(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>

      {modalOpen && (
        <ModalSubCategory onClose={handleClose} onEdit={CategoryToEdit}/>
      )}
    </section>
  );
};

export default CategoryPage;

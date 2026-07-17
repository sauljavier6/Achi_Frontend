import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  postSubCategory,
  getSubCategoryById,
  updateSubCategory,
} from "../../../api/Post/SubCategoryApi/SubCategoryApi";

interface Props {
  onClose: () => void;
  onCreated?: (id: number) => void;
  onEdit?: number | null;
}

export default function ModalSubCategory({ onClose, onCreated, onEdit }: Props) {
  const [description, setDescription] = useState("");
  const [state, setState ] = useState("");

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["subcategory", onEdit],
    queryFn: () => getSubCategoryById(onEdit!),
    enabled: !!onEdit,
  });

  useEffect(() => {
    if (data?.data) {
      setDescription(data.data.Description);
      setState(data.data.State);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: onEdit
      ? (payload: any) =>
          updateSubCategory({ id: onEdit, data: payload })
      : postSubCategory,

    onSuccess: (data) => {
      toast.success(onEdit ? "Subcategoría actualizada" : "Subcategoría creada");
      queryClient.invalidateQueries({ queryKey: ["subcategory"] });
      onCreated?.(data.ID_SubCategory);
      onClose();
    },
    onError: () =>
      toast.error(
        onEdit ? "Error al actualizar" : "Error al crear subcategoría"
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    mutation.mutate({
      Description: description,
      State: state,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">
          {onEdit ? "Editar subcategoría" : "Nueva subcategoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion"
            className="w-full border px-3 py-2 rounded"
          />

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="" disabled>
              Seleccione opción
            </option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded"
            >
              {onEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

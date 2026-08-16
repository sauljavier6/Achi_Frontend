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
type SubCategoryPayload = { Description: string; State: boolean };

export default function ModalSubCategory({ onClose, onCreated, onEdit }: Props) {
  const [description, setDescription] = useState("");
  const [state, setState] = useState(true);

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["subcategory", onEdit],
    queryFn: () => getSubCategoryById(onEdit!),
    enabled: !!onEdit,
  });

  useEffect(() => {
    if (data?.data) {
      setDescription(data.data.Description);
      setState(Boolean(data.data.State));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: onEdit
      ? (payload: SubCategoryPayload) =>
          updateSubCategory({ id: onEdit, data: payload })
      : postSubCategory,

    onSuccess: (data) => {
      toast.success(onEdit ? "Subcategoría actualizada" : "Subcategoría creada");
      queryClient.invalidateQueries({ queryKey: ["subcategory"] });
      onCreated?.(data.data?.ID_SubCategory ?? data.ID_SubCategory);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <p className="text-sm font-semibold text-[#c70063]">Catálogo</p><h2 className="mb-5 text-xl font-bold text-slate-900">
          {onEdit ? "Editar subcategoría" : "Nueva subcategoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nombre de la subcategoría"
            aria-label="Nombre de la subcategoría"
            required
            className="w-full border px-3 py-2 rounded"
          />

          <select aria-label="Estado de la subcategoría"
            value={state ? "true" : "false"}
            onChange={(e) => setState(e.target.value === "true")}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="" disabled>
              Seleccione opción
            </option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700">
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#c70063] px-4 py-2.5 font-semibold text-white hover:bg-[#a90054] disabled:opacity-60"
              disabled={mutation.isPending}
            >
              {onEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

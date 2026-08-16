import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  postCategory,
  getCategoryById,
  updateCategory,
} from "../../../api/Post/CategoryApi/CategoryApi";

interface Props {
  onClose: () => void;
  onCreated?: (id: number) => void;
  onEdit?: number | null;
}
type CategoryPayload = { Description: string; State: boolean };

export default function ModalCategory({ onClose, onCreated, onEdit }: Props) {
  const [description, setDescription] = useState("");
  const [state, setState] = useState(true);

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["category", onEdit],
    queryFn: () => getCategoryById(onEdit!),
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
      ? (payload: CategoryPayload) =>
          updateCategory({ id: onEdit, data: payload })
      : postCategory,

    onSuccess: (data) => {
      toast.success(onEdit ? "Categoría actualizada" : "Categoría creada");
      queryClient.invalidateQueries({ queryKey: ["category"] });
      onCreated?.(data.data?.ID_Category ?? data.ID_Category);
      onClose();
    },
    onError: () =>
      toast.error(
        onEdit ? "Error al actualizar" : "Error al crear categoría"
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
          {onEdit ? "Editar categoría" : "Nueva categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nombre de la categoría"
            aria-label="Nombre de la categoría"
            required
            className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
          />

          <select aria-label="Estado de la categoría"
            value={state ? "true" : "false"}
            onChange={(e) => setState(e.target.value === "true")}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-[#c70063] focus:ring-2 focus:ring-[#c70063]/10"
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

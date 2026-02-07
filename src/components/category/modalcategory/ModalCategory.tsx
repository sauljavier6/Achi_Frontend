// components/modals/ModalCategory.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { postCategory } from "../../../api/Post/CategoryApi/CategoryApi";

interface Props {
  onClose: () => void;
  onCreated: (id: number) => void;
}

export default function ModalCategory({ onClose, onCreated }: Props) {
  const [description, setDescription] = useState("");
  const [genero, setGenero] = useState("");

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: postCategory,
    onSuccess: (data) => {
      toast.success("Categoría creada");
      queryClient.invalidateQueries({ queryKey: ["category"] });
      onCreated(data.ID_Category);
      onClose();
    },
    onError: () => toast.error("Error al crear categoría"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    mutate({
      Description: description,
      Genero: genero,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Nueva categoría</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion"
            className="w-full border px-3 py-2 rounded"
          />

          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="" disabled>
              Seleccione opción
            </option>

            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Niño">Niño</option>
            <option value="Niña">Niña</option>
            <option value="Unisex">Unisex</option>
          </select>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

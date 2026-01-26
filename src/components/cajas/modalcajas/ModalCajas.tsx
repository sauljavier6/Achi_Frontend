import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getBatchbyIs,
  postBatch,
  putBatch,
} from "../../../api/Post/BatchApi/BatchApi";
import { getCorteCaja } from "../../../api/Post/InformationApi/InformationApi";
import { getAuthUser } from "../../../utils/auth";

interface ModalCajasProps {
  onClose: () => void;
  onEdit?: number;
}

const ModalCajas = ({ onClose, onEdit }: ModalCajasProps) => {
  const usuario = getAuthUser();
  const idusuario = usuario?.ID_User;

  const [formData, setFormData] = useState({
    operador: idusuario,
    lote: createBatch(),
    fecha: getTodayDate() || "",
    estado: true,
  });


  useEffect(() => {
    if (onEdit) {
      fetchBatch(onEdit);
    }
  }, [onEdit]);

  const fetchBatch = async (id: number) => {
    try {
      const res = await getBatchbyIs(id);
      const data = res.data;

      setFormData((prev) => ({
        ...prev,
        lote: data.Lote,
        estado: data.State ?? data.Estado,
        fecha: data.Date ? data.Date.slice(0, 10) : "",
        operador: idusuario,
      }));
    } catch (error) {
      console.error("Error al obtener el lote:", error);
    }
  };

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  function createBatch() {
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${datePart}-${idusuario}-${randomPart}`;
  }

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: postBatch,
    onError: (error) => {
      toast.error(`${error.message}`, {
        position: "top-right",
      });
    },
    onSuccess: () => {
      setFormData({
        operador: idusuario,
        lote: "",
        fecha: "",
        estado: true,
      });
      onClose();
      toast.success("Lote creado con éxito", {
        position: "top-right",
        progressClassName: "custom-progress",
      });
      queryClient.invalidateQueries({ queryKey: ["batchs"] });
    },
  });

  const { mutate: editMutate } = useMutation({
    mutationFn: putBatch,
    onError: (error) => {
      toast.error(`${error.message}`, {
        position: "top-right",
      });
    },
    onSuccess: () => {
      setFormData({
        operador: idusuario,
        lote: "",
        fecha: "",
        estado: true,
      });
      onClose();
      toast.success("Lote cerrado con éxito", {
        position: "top-right",
        progressClassName: "custom-progress",
      });
      queryClient.invalidateQueries({ queryKey: ["batchs"] });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onEdit) {
      const data = {
        id_batch: onEdit,
        operador: idusuario || "",
        lote: formData.lote,
        fecha: formData.fecha,
        estado: formData.estado,
      };

      editMutate(data);
    } else {
      mutate({
        ...formData,
        operador: idusuario || "",
      });
    }

    onClose();
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
   await getCorteCaja(formData.lote);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Crear lote</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <img src="/icons/close.png" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
            <input
              type="text"
              name="operador"
              value={formData.operador}
              onChange={handleChange}
              placeholder="Nombre del operador"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="lote"
              value={formData.lote}
              onChange={handleChange}
              placeholder="Lote"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              placeholder="Fecha"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              name="estado"
              value={String(formData.estado)}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value === "true" })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="true">Abierto</option>
              <option value="false">Cerrado</option>
            </select>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-center mt-6 gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
            >
              Guardar lote
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-yellow-300 text-black rounded hover:bg-yellow-200 transition"
            >
              Descargar lote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCajas;

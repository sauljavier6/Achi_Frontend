import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getBatchbyIs,
  postBatch,
  getBatchSummary,
  closeBatch,
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
    fondoInicial: 0,
  });
  const [summary, setSummary] = useState<any>(null);
  const [countedCash, setCountedCash] = useState("");
  const [notes, setNotes] = useState("");


  useEffect(() => {
    if (!onEdit) return;
    const fetchBatch = async () => {
      try {
        const res = await getBatchbyIs(onEdit);
        const data = res.data;
        setFormData((prev) => ({ ...prev, lote: data.Lote, estado: data.State ?? data.Estado,
          fecha: data.Date ? data.Date.slice(0, 10) : "", operador: idusuario, fondoInicial: Number(data.OpeningAmount || 0) }));
        const detail = await getBatchSummary(onEdit);
        setSummary(detail.summary);
        setCountedCash(String(detail.summary.expectedCash ?? ""));
      } catch {
        toast.error("No fue posible cargar los datos de la caja.");
      }
    };
    void fetchBatch();
  }, [idusuario, onEdit]);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  function createBatch() {
    const now = new Date();
    const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${datePart}${String(idusuario).padStart(3, "0")}${randomPart}`;
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
        fondoInicial: 0,
      });
      onClose();
      toast.success("Turno de caja abierto correctamente", {
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
      if (!window.confirm("¿Confirmas el corte? El turno quedará cerrado y ya no podrá registrar más ventas.")) return;
      closeBatch({ ID_Batch: onEdit, countedCash: Number(countedCash), notes })
        .then(() => { toast.success("Corte de caja registrado correctamente"); queryClient.invalidateQueries({ queryKey: ["batchs"] }); onClose(); })
        .catch((error) => toast.error(error.message));
    } else {
      mutate({
        ...formData,
        operador: idusuario || "",
      });
    }

  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
   await getCorteCaja(formData.lote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div><p className="text-sm font-semibold text-[#c70063]">Turno de caja</p><h2 className="text-xl font-bold text-slate-900">{onEdit ? "Cerrar turno y hacer corte" : "Abrir nuevo turno"}</h2></div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <img src="/icons/close.png" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <p className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{onEdit ? "Verifica el turno antes de cerrarlo. Después del corte no se podrán agregar más ventas ni retiros." : "Se generará un folio automático para identificar todas las ventas y movimientos de este turno."}</p>
          <div className="mb-6 grid grid-cols-1 gap-4">
            <label>Operador<input
              type="text"
              name="operador"
              value={formData.operador}
              onChange={handleChange}
              placeholder="Operador"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            /></label>
            <label>Folio del turno<input
              type="text"
              name="lote"
              value={formData.lote}
              onChange={handleChange}
              placeholder="Folio"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            /></label>
            <label>Fecha<input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              placeholder="Fecha"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            /></label>
            {!onEdit && <label>Fondo inicial<input
              type="number" min="0" step="0.01" name="fondoInicial"
              value={formData.fondoInicial} onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c70063]/30"
            /></label>}

            {onEdit && summary && <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span>Fondo inicial</span><strong>${Number(summary.openingAmount).toFixed(2)}</strong></div>
              {Object.entries(summary.byMethod || {}).map(([name, value]) => <div key={name} className="flex justify-between"><span>{name}</span><strong>${Number(value).toFixed(2)}</strong></div>)}
              <div className="flex justify-between text-red-700"><span>Retiros</span><strong>−${Number(summary.withdrawals).toFixed(2)}</strong></div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base"><span>Efectivo esperado</span><strong>${Number(summary.expectedCash).toFixed(2)}</strong></div>
            </div>}
            {onEdit && <><label>Efectivo contado<input type="number" min="0" step="0.01" value={countedCash} onChange={(e) => setCountedCash(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c70063]/30" /></label>
            <label>Notas del corte<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones o explicación de diferencias" className="min-h-20 w-full rounded-md border border-gray-300 px-4 py-2" /></label>
            {countedCash !== "" && summary && <div className={`rounded-xl p-3 text-sm font-semibold ${Math.abs(Number(countedCash) - Number(summary.expectedCash)) < .01 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>Diferencia: ${(Number(countedCash) - Number(summary.expectedCash)).toFixed(2)}</div>}</>}

          </div>

          {/* Botón guardar */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="submit"
              className="rounded-xl bg-[#c70063] px-5 py-2.5 font-semibold text-white hover:bg-[#a90054]"
            >
              {onEdit ? "Confirmar corte y cerrar" : "Abrir turno"}
            </button>
            {onEdit && <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Descargar resumen
            </button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCajas;

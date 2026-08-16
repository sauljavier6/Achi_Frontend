import { useQuery } from "@tanstack/react-query";
import { Eye, Scissors, WalletCards } from "lucide-react";
import { getBatch } from "../../../api/Post/BatchApi/BatchApi";

interface CajasListProps {
  openCaja: (lote: string) => void;
  openCut: (id: number) => void;
  searchTerm: string;
}

export interface Batch {
  ID_Batch: number;
  Lote: string;
  Date: Date;
  User: { ID_User: number; Name: string };
  State: boolean;
}

const formatDate = (date: Date) => new Date(date).toLocaleString("es-MX", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export default function CajasList({ openCaja, openCut, searchTerm }: CajasListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["batchs", searchTerm],
    queryFn: () => getBatch(searchTerm),
    placeholderData: (previous) => previous,
  });
  const batches: Batch[] = data?.data ?? [];

  if (isLoading) return <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">Cargando turnos de caja…</div>;
  if (!batches.length) return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center"><WalletCards className="mx-auto mb-3 text-slate-400" /><p className="font-bold text-slate-800">No hay turnos de caja</p><p className="text-sm text-slate-500">Abre una caja para comenzar a registrar ventas.</p></div>;

  return <>
    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
      <table className="min-w-full text-sm">
        <thead><tr><th>Turno</th><th>Operador</th><th>Apertura</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
        <tbody>{batches.map((batch) => <tr key={batch.ID_Batch}>
          <td><p className="font-bold text-slate-900">Caja #{batch.ID_Batch}</p><p className="font-mono text-xs text-slate-400">{batch.Lote.replace(/-/g, "")}</p></td>
          <td>{batch.User?.Name || "Sin operador"}</td><td>{formatDate(batch.Date)}</td>
          <td><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${batch.State ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{batch.State ? "Abierta" : "Cerrada"}</span></td>
          <td><div className="flex justify-end gap-2"><button onClick={() => openCaja(batch.Lote)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"><Eye size={16} />{batch.State ? "Operar" : "Ver resumen"}</button>{batch.State && <button onClick={() => openCut(batch.ID_Batch)} className="inline-flex items-center gap-2 rounded-xl bg-[#c70063] px-3 py-2 font-semibold text-white hover:bg-[#a90054]"><Scissors size={16} />Hacer corte</button>}</div></td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="space-y-3 md:hidden">{batches.map((batch) => <article key={batch.ID_Batch} className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">Caja #{batch.ID_Batch}</p><p className="text-sm text-slate-500">{batch.User?.Name || "Sin operador"}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${batch.State ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{batch.State ? "Abierta" : "Cerrada"}</span></div>
      <p className="mt-3 text-xs text-slate-500">{formatDate(batch.Date)}</p><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => openCaja(batch.Lote)} className="rounded-xl border border-slate-300 px-3 py-2.5 font-semibold text-slate-700">{batch.State ? "Operar" : "Resumen"}</button>{batch.State && <button onClick={() => openCut(batch.ID_Batch)} className="rounded-xl bg-[#c70063] px-3 py-2.5 font-semibold text-white">Hacer corte</button>}</div>
    </article>)}</div>
  </>;
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { getDatos } from "../../../api/Post/InformationApi/InformationApi";

type SourceRecord = { ID_Sale?: number; ID_Retiro?: number; Total?: number; Balance_Total?: number; Amount?: number; createdAt: string };
type Movement = { kind: "Venta" | "Retiro"; total: number; balance?: number; date: string };
const money = (value: unknown) => Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function SalesByBatchList({ Lote }: { Lote: string }) {
  const { data: information } = useQuery({ queryKey: ["information", Lote], queryFn: () => getDatos(Lote), enabled: !!Lote });
  const rows = useMemo<Movement[]>(() => ((information?.data ?? []) as SourceRecord[]).map<Movement>((item) => item.ID_Sale ? { kind: "Venta", total: Number(item.Total || 0), balance: Number(item.Balance_Total || 0), date: item.createdAt } : { kind: "Retiro", total: Number(item.Amount || 0), date: item.createdAt }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [information]);
  return <div className="space-y-4"><div><p className="text-sm font-semibold text-[#c70063]">Actividad</p><h2 className="text-xl font-bold text-slate-900">Movimientos del turno</h2><p className="text-sm text-slate-500">Ventas y retiros ordenados del más reciente al más antiguo.</p></div>{!rows.length ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center"><History className="mx-auto mb-2 text-slate-400" /><p className="font-semibold text-slate-700">Todavía no hay movimientos</p></div> : <div className="space-y-2">{rows.map((row, index) => { const sale = row.kind === "Venta"; const Icon = sale ? ArrowUpRight : ArrowDownLeft; return <div key={`${row.date}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${sale ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}><Icon size={18} /></span><div className="min-w-0 flex-1"><p className="font-bold text-slate-900">{row.kind}</p><p className="truncate text-xs text-slate-500">{new Date(row.date).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div><p className={`font-bold ${sale ? "text-emerald-700" : "text-red-700"}`}>{sale ? "+" : "−"}{money(row.total)}</p></div>; })}</div>}</div>;
}

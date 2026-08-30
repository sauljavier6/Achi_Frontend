import { useQuery } from "@tanstack/react-query";
import { Banknote, CreditCard, Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { getDatos } from "../../../api/Post/InformationApi/InformationApi";

const money = (value: unknown) => Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function DetallesCaja({ Lote }: { Lote: string }) {
  const { data: information, isLoading } = useQuery({ queryKey: ["information", Lote], queryFn: () => getDatos(Lote), enabled: !!Lote });
  const totals = information?.totales ?? {};
  const net = Number(totals.efectivoEsperado || 0);
  if (isLoading) return <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">Calculando resumen…</div>;

  const methods = [
    { label: "Efectivo", value: totals.efectivo, icon: Banknote },
    { label: "Tarjetas", value: totals.tarjetas, icon: CreditCard },
    { label: "Cheques", value: totals.cheques, icon: Landmark },
  ];
  return <div className="space-y-4">
    <div><p className="text-sm font-semibold text-[#c70063]">Resumen del turno</p><h2 className="text-xl font-bold text-slate-900">Dinero esperado en caja</h2><p className="text-sm text-slate-500">Totales calculados con las ventas y retiros registrados.</p></div>
    <div className="rounded-2xl bg-[#007782] p-5 text-white"><div className="flex items-center gap-2 text-white/75"><Wallet size={18} /><span className="text-sm font-semibold">Efectivo esperado</span></div><p className="mt-2 text-3xl font-black">{money(net)}</p><p className="mt-1 text-xs text-white/70">Fondo inicial + cobros en efectivo − retiros</p></div>
    <div className="grid gap-3 sm:grid-cols-3">{methods.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-slate-200 p-4"><Icon size={18} className="mb-3 text-[#007782]" /><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{money(value)}</p></div>)}</div>
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold text-slate-600">Fondo inicial</p><p className="mt-2 text-xl font-bold">{money(totals.fondoInicial)}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="flex items-center gap-2 text-emerald-700"><TrendingUp size={18} /><span className="font-semibold">Ventas</span></div><p className="mt-2 text-xl font-bold text-emerald-800">{money(totals.ventas)}</p></div><div className="rounded-2xl bg-red-50 p-4"><div className="flex items-center gap-2 text-red-700"><TrendingDown size={18} /><span className="font-semibold">Retiros y salidas</span></div><p className="mt-2 text-xl font-bold text-red-800">{money(totals.salidas)}</p></div></div>
  </div>;
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { addPayablePayment, downloadFinancial, getFinancialOverview } from "../../api/financialApi";
import { getPayments } from "../../api/Post/PaymentApi/PaymentApi";

const iso = (date: Date) => date.toISOString().slice(0, 10);
const money = (value: unknown) => Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function FinancialPage() {
  const client = useQueryClient();
  const [from, setFrom] = useState(iso(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(iso(new Date()));
  const [tab, setTab] = useState<"profit" | "receivables" | "payables">("profit");
  const [paying, setPaying] = useState<any>(null);
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const reportQuery = useQuery({ queryKey: ["financial", from, to], queryFn: () => getFinancialOverview(from, to) });
  const methodsQuery = useQuery({ queryKey: ["payments"], queryFn: getPayments });
  const mutation = useMutation({
    mutationFn: () => addPayablePayment(paying.id, { ID_Payment: Number(method), Monto: Number(amount), ReferenceNumber: reference }),
    onSuccess: (result) => {
      toast.success(result.message);
      setPaying(null); setMethod(""); setAmount(""); setReference("");
      client.invalidateQueries({ queryKey: ["financial"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo registrar el abono"),
  });
  const report = reportQuery.data?.data;
  const rows = tab === "profit" ? report?.profit : tab === "receivables" ? report?.receivables : report?.payables;
  const openPayment = (row: any) => { setPaying(row); setAmount(Number(row.balance).toFixed(2)); setMethod(""); setReference(""); };

  return <section className="space-y-5">
    <header><p className="font-bold text-[#c70063]">Administración</p><h1 className="text-3xl font-black">Finanzas y utilidad</h1><p className="text-slate-500">Saldos, vencimientos y utilidad con el costo congelado al momento de vender.</p></header>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <label className="text-sm font-semibold">Desde<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
      <label className="text-sm font-semibold">Hasta<input type="date" value={to} onChange={e => setTo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
      {[["Por cobrar", report?.summary.receivable], ["Por pagar", report?.summary.payable], ["Utilidad", report?.summary.profit]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><strong className="text-xl">{money(value)}</strong></div>)}
    </div>
    <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1">{[["profit", "Utilidad"], ["receivables", "Por cobrar"], ["payables", "Por pagar"]].map(([key, label]) => <button key={key} onClick={() => setTab(key as typeof tab)} className={`rounded-lg px-3 py-3 font-bold active:scale-[.98] ${tab === key ? "bg-white text-[#c70063] shadow-sm" : "text-slate-600"}`}>{label}</button>)}</div>
    <div className="flex flex-wrap justify-end gap-2"><button onClick={() => downloadFinancial(tab, "csv", from, to)} className="rounded-xl border border-[#007782]/30 px-4 py-2.5 font-bold text-[#007782] active:scale-[.98]">Descargar CSV</button><button onClick={() => downloadFinancial(tab, "xls", from, to)} className="rounded-xl bg-[#007782] px-4 py-2.5 font-bold text-white active:scale-[.98]">Descargar Excel</button></div>
    <article className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      {reportQuery.isLoading ? <p className="p-5">Calculando…</p> : reportQuery.error ? <p className="p-5 text-red-600">{reportQuery.error instanceof Error ? reportQuery.error.message : "Error"}</p> : <table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left uppercase text-slate-500"><tr>{tab === "profit" ? <><th className="p-4">Fecha</th><th>Ventas</th><th>Ingresos</th><th>Costo histórico</th><th>Utilidad</th></> : <><th className="p-4">Folio</th><th>{tab === "receivables" ? "Cliente" : "Proveedor"}</th><th>Vencimiento</th><th>Antigüedad</th><th>Saldo</th>{tab === "payables" && <th>Acción</th>}</>}</tr></thead><tbody>
        {rows?.map((row: any, index: number) => <tr key={`${row.id || row.date}-${index}`} className="border-t">{tab === "profit" ? <><td className="p-4">{new Date(`${row.date}T12:00:00`).toLocaleDateString("es-MX")}</td><td>{row.sales}</td><td>{money(row.revenue)}</td><td>{money(row.cost)}</td><td className={`font-bold ${row.profit >= 0 ? "text-emerald-700" : "text-red-600"}`}>{money(row.profit)}</td></> : <><td className="p-4 font-mono font-bold">{row.folio}</td><td>{row.party}</td><td>{new Date(row.dueDate || row.date).toLocaleDateString("es-MX")}</td><td><span className={`rounded-full px-2 py-1 text-xs font-bold ${row.days > 30 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{row.bucket}</span></td><td className="font-bold">{money(row.balance)}</td>{tab === "payables" && <td><button onClick={() => openPayment(row)} className="rounded-lg border border-[#007782]/30 px-3 py-2 font-bold text-[#007782] active:scale-[.98]">Registrar abono</button></td>}</>}</tr>)}
        {!rows?.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay movimientos en este periodo.</td></tr>}
      </tbody></table>}
    </article>
    {paying && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" onMouseDown={e => e.target === e.currentTarget && setPaying(null)}><form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"><div><p className="text-sm font-bold text-[#c70063]">Cuenta por pagar {paying.folio}</p><h2 className="text-2xl font-black">Registrar abono</h2><p className="text-slate-500">Saldo actual: {money(paying.balance)}</p></div><label className="block text-sm font-semibold">Forma de pago<select required value={method} onChange={e => setMethod(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3"><option value="">Selecciona una forma</option>{methodsQuery.data?.data?.filter((item:any) => item.Description?.toLowerCase() !== "crédito").map((item:any) => <option key={item.ID_Payment} value={item.ID_Payment}>{item.Description}</option>)}</select></label><label className="block text-sm font-semibold">Monto<input required min="0.01" max={paying.balance} step="0.01" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" /></label><label className="block text-sm font-semibold">Referencia o notas<input value={reference} onChange={e => setReference(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Opcional" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setPaying(null)} className="rounded-xl border px-4 py-3 font-bold">Cancelar</button><button disabled={mutation.isPending} className="rounded-xl bg-[#c70063] px-4 py-3 font-bold text-white disabled:opacity-50">{mutation.isPending ? "Guardando…" : "Guardar abono"}</button></div></form></div>}
  </section>;
}

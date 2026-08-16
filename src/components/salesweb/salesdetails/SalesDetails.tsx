import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, Download, Mail, MapPin, PackageCheck, Phone, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { getSaleById, pathStateWebSale, printRemision } from "../../../api/Post/SaleApi/SaleApi";
import { formatFolio } from "../../../utils/folio";

interface SaleProduct { ID_SaleProduct: number; Quantity: number; Product: { Description: string }; Stock: { Description: string; Saleprice: string } }
interface Venta { ID_Sale: number; Total: string; Subtotal: string; Iva: string; Envio?: string; StateWeb: boolean; createdAt: string; Cliente?: { Name: string; Email?: { Description?: string }; Phone?: { Description?: string } }; Address?: { Description?: string }; SaleProduct?: SaleProduct[] }
interface Props { sale: number | null; onCompleted?: () => void }
const money = (value: string | number | undefined) => `$${Number(value ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateTime = (value?: string) => value ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";

const SalesDetailComponent = ({ sale, onCompleted }: Props) => {
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { data, error, isLoading } = useQuery<Venta>({ queryKey: ["salewebbyid", sale], queryFn: () => getSaleById(sale!), enabled: sale !== null });

  const handlePrintRemision = async () => {
    if (!sale || isPrinting) return;
    setIsPrinting(true);
    try { await printRemision(sale); toast.success("Remisión descargada correctamente"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "No fue posible generar la remisión"); }
    finally { setIsPrinting(false); }
  };

  const handleCompletar = async () => {
    if (!sale || !data?.StateWeb || isCompleting) return;
    if (!window.confirm("¿Confirmas que el pedido fue preparado y entregado? Esta acción lo quitará de la lista de pendientes.")) return;
    setIsCompleting(true);
    try {
      const response = await pathStateWebSale(sale);
      if (!response.success) throw new Error(response.message || "No fue posible completar el pedido");
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["sales"] }), queryClient.invalidateQueries({ queryKey: ["salewebbyid", sale] })]);
      toast.success("Pedido marcado como entregado");
      onCompleted?.();
    } catch (err) { toast.error(err instanceof Error ? err.message : "No fue posible completar el pedido"); }
    finally { setIsCompleting(false); }
  };

  if (isLoading) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">Cargando pedido…</div>;
  if (error || !data) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">No fue posible cargar la información del pedido.</div>;
  const items = data.SaleProduct ?? [];
  const itemCount = items.reduce((total, item) => total + Number(item.Quantity), 0);

  return <div className="space-y-5">
    <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-[#c70063]">Recepción de pedidos</p><h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Pedido {formatFolio(data.ID_Sale)}</h2><p className="mt-1 text-sm text-slate-500">Recibido el {dateTime(data.createdAt)}</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${data.StateWeb ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{data.StateWeb ? <ClipboardCheck size={17} /> : <CheckCircle2 size={17} />}{data.StateWeb ? "Pendiente de preparar" : "Entregado"}</span></header>
    <section aria-label="Progreso del pedido" className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><div className="flex flex-col items-center gap-1 border-r border-slate-200 px-2 py-3 text-center text-[#007782]"><CheckCircle2 size={20} /><span className="text-xs font-bold sm:text-sm">Pago confirmado</span></div><div className={`flex flex-col items-center gap-1 border-r border-slate-200 px-2 py-3 text-center ${data.StateWeb ? "bg-white text-[#c70063]" : "text-[#007782]"}`}><PackageCheck size={20} /><span className="text-xs font-bold sm:text-sm">Preparar pedido</span></div><div className={`flex flex-col items-center gap-1 px-2 py-3 text-center ${data.StateWeb ? "text-slate-400" : "bg-white text-[#007782]"}`}><Truck size={20} /><span className="text-xs font-bold sm:text-sm">Entregado</span></div></section>
    <div className="grid gap-4 lg:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="font-bold text-slate-900">Cliente</h3><p className="mt-3 text-lg font-bold text-slate-800">{data.Cliente?.Name || "Cliente sin nombre"}</p><div className="mt-3 space-y-2 text-sm text-slate-600"><p className="flex min-w-0 items-center gap-2"><Mail size={16} className="shrink-0 text-[#007782]" /><span className="truncate">{data.Cliente?.Email?.Description || "Sin correo"}</span></p><p className="flex items-center gap-2"><Phone size={16} className="text-[#007782]" />{data.Cliente?.Phone?.Description || "Sin teléfono"}</p></div></section><section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="font-bold text-slate-900">Entrega</h3><p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600"><MapPin size={18} className="mt-0.5 shrink-0 text-[#c70063]" />{data.Address?.Description || "Dirección no registrada"}</p><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm"><span className="text-slate-500">Artículos a preparar</span><strong>{itemCount}</strong></div></section></div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5"><h3 className="flex items-center gap-2 font-bold text-slate-900"><ShoppingBag size={19} className="text-[#c70063]" />Productos del pedido</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{itemCount} artículos</span></div><div className="hidden sm:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-5 py-3">Producto</th><th className="px-3 py-3 text-center">Cantidad</th><th className="px-3 py-3 text-right">Precio</th><th className="px-5 py-3 text-right">Importe</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.ID_SaleProduct}><td className="px-5 py-4"><p className="font-bold text-slate-900">{item.Product.Description}</p><p className="text-xs text-slate-500">{item.Stock.Description}</p></td><td className="px-3 py-4 text-center font-bold">{item.Quantity}</td><td className="px-3 py-4 text-right text-slate-600">{money(item.Stock.Saleprice)}</td><td className="px-5 py-4 text-right font-bold">{money(item.Quantity * Number(item.Stock.Saleprice))}</td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 sm:hidden">{items.map((item) => <article key={item.ID_SaleProduct} className="p-4"><div className="flex justify-between gap-3"><div><p className="font-bold text-slate-900">{item.Product.Description}</p><p className="text-sm text-slate-500">{item.Stock.Description}</p></div><p className="shrink-0 font-bold">{money(item.Quantity * Number(item.Stock.Saleprice))}</p></div><p className="mt-2 text-sm text-slate-600">{item.Quantity} × {money(item.Stock.Saleprice)}</p></article>)}</div></section>
    <section className="ml-auto rounded-xl bg-slate-50 p-4 sm:max-w-md sm:p-5"><div className="space-y-2 text-sm"><div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{money(data.Subtotal)}</span></div><div className="flex justify-between text-slate-600"><span>IVA incluido</span><span>{money(data.Iva)}</span></div><div className="flex justify-between text-slate-600"><span>Envío</span><span>{money(data.Envio)}</span></div><div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xl font-bold"><span>Total</span><span>{money(data.Total)}</span></div></div></section>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><button onClick={handlePrintRemision} disabled={isPrinting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#007782] bg-white px-5 font-bold text-[#007782] hover:bg-[#007782]/5 disabled:opacity-50"><Download size={18} />{isPrinting ? "Generando…" : "Descargar remisión"}</button>{data.StateWeb && <button onClick={handleCompletar} disabled={isCompleting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c70063] px-5 font-bold text-white hover:bg-[#a90054] disabled:opacity-50"><PackageCheck size={19} />{isCompleting ? "Completando…" : "Confirmar preparación y entrega"}</button>}</div>
  </div>;
};
export default SalesDetailComponent;

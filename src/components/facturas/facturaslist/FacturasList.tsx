import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { cancelFactura, downloadFacturaAcuse, downloadFacturaPDF, downloadFacturaXML, getFacturacionSaleById, getFacturas, replaceFactura, sendFacturaEmail } from "../../../api/Post/FacturacionApi/FacturacionApi";
import { SAT_CFDI_USES, SAT_FISCAL_REGIMES } from "../../../constants/satCatalogs";

interface Factura {
  ID_FacturacionTicket: number; ID_Sale?: number | null; UUID?: string; Folio?: string; Folio_SAT?: string;
  Serie?: string; Fecha_Timbrado?: string; Estado: boolean; Status?: string;
  ReceiverRfc?: string; ReceiverName?: string; Subtotal?: number; Tax?: number; Total?: number;
  PaymentForm?: string; PaymentMethod?: string; CancellationMotive?: string; ErrorMessage?: string;
  InvoiceKind?: "INDIVIDUAL" | "GLOBAL" | "PAYMENT" | "SUBSTITUTION"; RelatedUuid?: string;
  Replacement?: { UUID?: string; Serie?: string; Folio?: string; Status?: string } | null;
  Sale?: { createdAt: string; Total: number };
}
const money = (value: unknown) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0));
const date = (value?: string) => value ? new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";
const shortUuid = (value?: string) => value ? `${value.slice(0, 8)}…${value.slice(-6)}` : "—";
const saleReference = (factura: Factura) =>
  factura.InvoiceKind === "GLOBAL" || !factura.ID_Sale
    ? "Factura global"
    : `Venta ${String(factura.ID_Sale).padStart(6, "0")}`;
const statusMeta = (status?: string, active?: boolean) => {
  if (status === "CANCELLED") return { label: "Cancelada", css: "bg-slate-100 text-slate-600" };
  if (status === "CANCELLATION_REQUESTED") return { label: "Cancelación pendiente", css: "bg-amber-50 text-amber-700" };
  if (status === "CANCELLATION_REJECTED") return { label: "Cancelación rechazada", css: "bg-red-50 text-red-700" };
  if (status === "ERROR") return { label: "Error", css: "bg-red-50 text-red-700" };
  if (status === "PROCESSING") return { label: "Procesando", css: "bg-blue-50 text-blue-700" };
  if (status === "STAMPED" || active) return { label: "Timbrada", css: "bg-emerald-50 text-emerald-700" };
  return { label: "Pendiente", css: "bg-slate-100 text-slate-600" };
};

const FacturasList = ({ searchTerm, status }: { searchTerm: string; status: string }) => {
  const [page, setPage] = useState(1);
  const [emailInvoice, setEmailInvoice] = useState<Factura | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [detail, setDetail] = useState<Factura | null>(null);
  const [cancelInvoice, setCancelInvoice] = useState<Factura | null>(null);
  const [motive, setMotive] = useState("02");
  const [replacementUuid, setReplacementUuid] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [replaceInvoice, setReplaceInvoice] = useState<Factura | null>(null);
  const [replaceData, setReplaceData] = useState({ RFC: "", RazonSocial: "", CodigoPostal: "", RegimenFiscal: "", UsoCFDI: "G03" });
  const [replacing, setReplacing] = useState(false);
  const limit = 10;
  useEffect(() => setPage(1), [searchTerm, status]);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["facturaslist", page, limit, searchTerm, status],
    queryFn: () => getFacturas({ page, limit, searchTerm, status }),
  });
  const facturas: Factura[] = data?.data || [];

  const download = async (kind: "pdf" | "xml", factura: Factura) => {
    if (!factura.UUID) return toast.error("Esta factura no tiene UUID");
    try { await (kind === "pdf" ? downloadFacturaPDF(factura.UUID) : downloadFacturaXML(factura.UUID)); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible descargar el archivo"); }
  };
  const copyUuid = async (uuid?: string) => {
    if (!uuid) return; await navigator.clipboard.writeText(uuid); toast.success("UUID copiado");
  };
  const send = async () => {
    if (!emailInvoice?.UUID) return;
    try {
      setSending(true);
      const result = await sendFacturaEmail(emailInvoice.UUID, email);
      toast.success(result.message || "Factura enviada correctamente");
      setEmailInvoice(null); setEmail("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible enviar la factura"); }
    finally { setSending(false); }
  };
  const requestCancellation = async () => {
    if (!cancelInvoice?.UUID) return;
    try {
      setCancelling(true);
      const result = await cancelFactura(cancelInvoice.UUID, motive, replacementUuid.trim() || undefined);
      toast.success(result.releasedSales
        ? `Factura global cancelada: ${result.releasedSales} ventas quedaron disponibles para volver a timbrar`
        : result.status === "CANCELLED" ? "Factura cancelada correctamente" : "Solicitud de cancelación enviada; las ventas permanecerán bloqueadas hasta su aceptación");
      setCancelInvoice(null); setMotive("02"); setReplacementUuid("");
      await refetch();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible cancelar el CFDI"); }
    finally { setCancelling(false); }
  };
  const downloadAcuse = async (factura: Factura) => {
    if (!factura.UUID) return;
    try { await downloadFacturaAcuse(factura.UUID); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible descargar el acuse"); }
  };
  const openReplacement = async (factura: Factura) => {
    if (!factura.ID_Sale) return toast.error("Sólo una factura individual puede sustituirse desde aquí");
    try {
      const sale = await getFacturacionSaleById(factura.ID_Sale); const fiscal = sale?.Facturacion || {};
      setReplaceData({ RFC: fiscal.RFC || factura.ReceiverRfc || "", RazonSocial: fiscal.RazonSocial || factura.ReceiverName || "", CodigoPostal: fiscal.CodigoPostal || "", RegimenFiscal: fiscal.RegimenFiscal || "", UsoCFDI: fiscal.UsoCFDI || "G03" });
      setReplaceInvoice(factura); setDetail(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible preparar la sustitución"); }
  };
  const submitReplacement = async () => {
    if (!replaceInvoice?.UUID) return;
    if (!SAT_FISCAL_REGIMES.some(([code]) => code === replaceData.RegimenFiscal)) return toast.error("Selecciona un régimen fiscal válido del SAT");
    if (!SAT_CFDI_USES.some(([code]) => code === replaceData.UsoCFDI)) return toast.error("Selecciona un uso CFDI válido del SAT");
    try { setReplacing(true); const result = await replaceFactura(replaceInvoice.UUID, replaceData); toast.success(result.warning || "CFDI sustituto emitido y cancelación del original solicitada"); setReplaceInvoice(null); await refetch(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible sustituir el CFDI"); }
    finally { setReplacing(false); }
  };
  const Actions = ({ factura }: { factura: Factura }) => {
    const enabled = Boolean(factura.UUID) && (factura.Status === "STAMPED" || factura.Estado);
    return <div className="grid grid-cols-2 gap-1.5">
      <button onClick={() => setDetail(factura)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700">Detalle</button>
      <button disabled={!enabled} onClick={() => download("pdf", factura)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">PDF</button>
      <button disabled={!enabled} onClick={() => download("xml", factura)} className="rounded-lg border border-[#007782]/25 bg-white px-2 py-2 text-xs font-bold text-[#007782] disabled:opacity-40">XML</button>
      <button disabled={!enabled} onClick={() => setEmailInvoice(factura)} className="rounded-lg bg-[#007782] px-2 py-2 text-xs font-bold text-white disabled:opacity-40">Enviar</button>
      <button disabled={!enabled || !factura.ID_Sale || factura.Status !== "STAMPED"} onClick={() => openReplacement(factura)} className="rounded-lg border border-amber-200 bg-white px-2 py-2 text-xs font-bold text-amber-700 disabled:opacity-40">Sustituir</button>
      {factura.Status === "CANCELLATION_REQUESTED" ? <button onClick={async () => { await downloadAcuse(factura); await refetch(); }} className="rounded-lg border border-amber-200 bg-white px-2 py-2 text-xs font-bold text-amber-700">Verificar</button> : <button disabled={!enabled || factura.Status === "CANCELLED"} onClick={() => setCancelInvoice(factura)} className="rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-bold text-red-600 disabled:opacity-40">Cancelar</button>}
    </div>;
  };

  return <>
    <div className="mb-3 flex items-center justify-between text-sm text-slate-500"><span>{data?.totalItems || 0} comprobantes</span>{isFetching && <span>Actualizando…</span>}</div>
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 lg:block">
      <table className="w-full table-fixed text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Folio / venta</th><th className="px-4 py-3">Receptor</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">UUID</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{facturas.map((f) => { const meta = statusMeta(f.Status, f.Estado); return <tr key={f.ID_FacturacionTicket} className="hover:bg-slate-50/70"><td className="px-4 py-4"><strong>{f.Serie || ""}{f.Folio || f.Folio_SAT || "—"}</strong>{f.InvoiceKind === "SUBSTITUTION" && <span className="ml-2 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Sustituto</span>}<div className="text-xs text-slate-500">{saleReference(f)}</div></td><td className="px-4 py-4"><div className="font-medium text-slate-800">{f.ReceiverName || "Sin receptor"}</div><div className="text-xs text-slate-500">{f.ReceiverRfc || "—"}</div></td><td className="px-4 py-4 text-slate-600">{date(f.Fecha_Timbrado || f.Sale?.createdAt)}</td><td className="px-4 py-4 font-bold">{money(f.Total ?? f.Sale?.Total)}</td><td className="px-4 py-4"><button onClick={() => copyUuid(f.UUID)} title={f.UUID} className="font-mono text-xs text-[#007782] hover:underline">{shortUuid(f.UUID)}</button></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.css}`}>{meta.label}</span></td><td className="px-2 py-4"><Actions factura={f}/></td></tr>; })}</tbody></table>
    </div>
    <div className="grid gap-3 lg:hidden">{facturas.map((f) => { const meta = statusMeta(f.Status, f.Estado); return <article key={f.ID_FacturacionTicket} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-bold text-slate-900">{f.Serie || ""}{f.Folio || f.Folio_SAT || `Venta ${f.ID_Sale}`}</p><p className="text-xs text-slate-500">{saleReference(f)} · {date(f.Fecha_Timbrado)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.css}`}>{meta.label}</span></div><div className="my-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3"><div><span className="text-xs text-slate-500">Receptor</span><p className="truncate font-semibold">{f.ReceiverName || "—"}</p><p className="text-xs text-slate-500">{f.ReceiverRfc}</p></div><div className="text-right"><span className="text-xs text-slate-500">Total</span><p className="text-lg font-bold">{money(f.Total ?? f.Sale?.Total)}</p></div></div><button onClick={() => copyUuid(f.UUID)} className="mb-3 block font-mono text-xs text-[#007782]">UUID: {shortUuid(f.UUID)}</button><Actions factura={f}/></article>; })}</div>
    {!facturas.length && !isFetching && <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">No encontramos facturas con estos filtros.</div>}
    <div className="mt-4 flex items-center justify-end gap-2"><button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg bg-slate-100 px-4 py-2 font-bold disabled:opacity-40">Anterior</button><span className="px-2 text-sm text-slate-500">{page} de {data?.totalPages || 1}</span><button disabled={page >= (data?.totalPages || 1)} onClick={() => setPage(p => p + 1)} className="rounded-lg bg-slate-100 px-4 py-2 font-bold disabled:opacity-40">Siguiente</button></div>
    {emailInvoice && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setEmailInvoice(null)}><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onMouseDown={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-[#c70063]">Enviar CFDI</p><h3 className="text-xl font-bold">PDF y XML por correo</h3></div><button onClick={() => setEmailInvoice(null)} className="text-2xl">×</button></div><p className="mt-2 text-sm text-slate-500">Se enviarán ambos documentos de la factura {emailInvoice.Serie}{emailInvoice.Folio}.</p><label className="mt-5 block text-sm font-semibold">Correo del destinatario<input autoFocus type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="cliente@correo.com" className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal"/></label><div className="mt-5 flex gap-2"><button onClick={() => setEmailInvoice(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-bold">Cancelar</button><button disabled={sending || !email.trim()} onClick={send} className="flex-1 rounded-lg bg-[#c70063] px-4 py-3 font-bold text-white disabled:opacity-50">{sending ? "Enviando…" : "Enviar factura"}</button></div></div></div>}
    {detail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setDetail(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6" onMouseDown={e => e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-[#c70063]">Detalle fiscal</p><h3 className="text-2xl font-bold">Factura {detail.Serie}{detail.Folio || detail.Folio_SAT}</h3></div><button onClick={() => setDetail(null)} className="text-2xl">×</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Receptor</p><p className="mt-1 font-bold">{detail.ReceiverName || "—"}</p><p className="text-sm text-slate-600">{detail.ReceiverRfc || "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">Emisión</p><p className="mt-1 font-bold">{date(detail.Fecha_Timbrado)}</p><p className="text-sm text-slate-600">{saleReference(detail)}</p></div></div><div className="mt-3 rounded-xl border border-slate-200 p-4"><div className="flex justify-between py-1"><span>Subtotal</span><span>{money(detail.Subtotal)}</span></div><div className="flex justify-between py-1"><span>IVA</span><span>{money(detail.Tax)}</span></div><div className="mt-2 flex justify-between border-t pt-3 text-lg font-bold"><span>Total</span><span>{money(detail.Total ?? detail.Sale?.Total)}</span></div></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase text-slate-500">Pago</p><p className="mt-1">Forma {detail.PaymentForm || "—"} · Método {detail.PaymentMethod || "—"}</p></div><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase text-slate-500">Estado</p><p className="mt-1 font-bold">{statusMeta(detail.Status, detail.Estado).label}</p>{detail.CancellationMotive && <p className="text-sm text-slate-500">Motivo {detail.CancellationMotive}</p>}</div></div><div className="mt-3 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-500">UUID</p><button onClick={() => copyUuid(detail.UUID)} className="mt-1 break-all text-left font-mono text-sm text-[#007782]">{detail.UUID || "—"}</button></div>{detail.InvoiceKind === "SUBSTITUTION" && detail.RelatedUuid && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Este CFDI sustituye al original:</strong><p className="mt-1 break-all font-mono text-xs">{detail.RelatedUuid}</p></div>}{detail.Replacement?.UUID && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Esta factura fue sustituida por {detail.Replacement.Serie}{detail.Replacement.Folio}:</strong><p className="mt-1 break-all font-mono text-xs">{detail.Replacement.UUID}</p></div>}{detail.ErrorMessage && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{detail.ErrorMessage}</div>}<div className="mt-5 flex flex-wrap gap-2"><button disabled={!detail.UUID} onClick={() => download("pdf", detail)} className="rounded-lg bg-[#c70063] px-4 py-3 font-bold text-white disabled:opacity-40">Descargar PDF</button><button disabled={!detail.UUID} onClick={() => download("xml", detail)} className="rounded-lg border border-[#007782]/25 px-4 py-3 font-bold text-[#007782] disabled:opacity-40">Descargar XML</button>{detail.Status === "CANCELLED" && <button onClick={() => downloadAcuse(detail)} className="rounded-lg bg-slate-800 px-4 py-3 font-bold text-white">Descargar acuse</button>}</div>{detail.Status === "CANCELLATION_REQUESTED" && <p className="mt-3 text-xs text-slate-500">La cancelación quedó solicitada. El sistema no hará consultas posteriores con costo.</p>}</div></div>}
    {cancelInvoice && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setCancelInvoice(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6" onMouseDown={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-red-600">Cancelación SAT</p><h3 className="text-xl font-bold">Cancelar factura {cancelInvoice.Serie}{cancelInvoice.Folio}</h3></div><button onClick={() => setCancelInvoice(null)} className="text-2xl">×</button></div><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Esta acción envía una solicitud al PAC. No elimina la venta ni el registro de auditoría.{cancelInvoice.InvoiceKind === "GLOBAL" && <strong className="mt-2 block">Si cancelas la global con motivo 02 y el SAT la acepta, sus ventas volverán a aparecer en Factura global.</strong>}</div><label className="mt-4 block text-sm font-bold">Motivo de cancelación<select value={motive} onChange={e => setMotive(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal"><option value="02">02 - Comprobante emitido con errores sin relación</option><option value="01">01 - Comprobante emitido con errores con relación</option><option value="03">03 - No se llevó a cabo la operación</option>{cancelInvoice.InvoiceKind !== "GLOBAL" && <option value="04">04 - Operación nominativa relacionada en factura global</option>}</select></label>{motive === "01" && <label className="mt-4 block text-sm font-bold">UUID del CFDI sustituto<input value={replacementUuid} onChange={e => setReplacementUuid(e.target.value.trim().toUpperCase())} placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 font-mono font-normal"/></label>}<div className="mt-5 flex gap-2"><button onClick={() => setCancelInvoice(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-bold">Conservar factura</button><button disabled={cancelling || (motive === "01" && !replacementUuid)} onClick={requestCancellation} className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-bold text-white disabled:opacity-50">{cancelling ? "Solicitando…" : "Solicitar cancelación"}</button></div></div></div>}
    {replaceInvoice && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={() => setReplaceInvoice(null)}><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6" onMouseDown={e => e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-amber-700">Sustitución CFDI</p><h3 className="text-xl font-bold">Corregir factura {replaceInvoice.Serie}{replaceInvoice.Folio}</h3></div><button onClick={() => setReplaceInvoice(null)} className="text-2xl">×</button></div><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Orden segura:</strong> se timbra el CFDI corregido con relación 04 y sólo al obtener su UUID se solicita cancelar el original con motivo 01.</div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">RFC<input value={replaceData.RFC} onChange={e => setReplaceData(data => ({ ...data, RFC: e.target.value.toUpperCase() }))} className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal"/></label><label className="text-sm font-bold">Razón social<input value={replaceData.RazonSocial} onChange={e => setReplaceData(data => ({ ...data, RazonSocial: e.target.value.toUpperCase() }))} className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal"/></label><label className="text-sm font-bold">Código postal fiscal<input inputMode="numeric" maxLength={5} value={replaceData.CodigoPostal} onChange={e => setReplaceData(data => ({ ...data, CodigoPostal: e.target.value.replace(/\D/g, "") }))} className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal"/></label><label className="text-sm font-bold">Régimen fiscal<select value={replaceData.RegimenFiscal} onChange={e => setReplaceData(data => ({ ...data, RegimenFiscal: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal"><option value="">Selecciona régimen fiscal</option>{SAT_FISCAL_REGIMES.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}</select></label><label className="text-sm font-bold sm:col-span-2">Uso CFDI<select value={replaceData.UsoCFDI} onChange={e => setReplaceData(data => ({ ...data, UsoCFDI: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal">{SAT_CFDI_USES.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}</select></label></div><p className="mt-4 text-xs text-slate-500">Los conceptos, importes, impuestos y forma de pago se reconstruyen desde la venta guardada.</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setReplaceInvoice(null)} className="rounded-lg border border-slate-200 px-5 py-3 font-bold">Conservar original</button><button disabled={replacing || !replaceData.RFC || !replaceData.RazonSocial || replaceData.CodigoPostal.length !== 5 || replaceData.RegimenFiscal.length !== 3} onClick={submitReplacement} className="rounded-lg bg-amber-600 px-5 py-3 font-bold text-white disabled:opacity-40">{replacing ? "Timbrando sustituto…" : "Emitir sustituto y cancelar original"}</button></div></div></div>}
  </>;
};
export default FacturasList;

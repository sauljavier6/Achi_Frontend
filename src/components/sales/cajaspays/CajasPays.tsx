import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ModalCustomers from "../customers/modalcustomers/ModalCustomers";
import { getSaleById, postCustomerWithSale, postPaymentSale, putCustomerSale } from "../../../api/Post/SaleApi/SaleApi";
import { getPayments } from "../../../api/Post/PaymentApi/PaymentApi";
import { openTicket, sendTicket } from "../../../api/Post/TicketApi/TicketApi";
import { formatFolio } from "../../../utils/folio";

interface CustomerFormData {
  ID_User?: number;
  Name: string;
  Phone: string;
  Email: string;
  RazonSocial?: string;
  CodigoPostal?: string;
  Rfc?: string;
  RegimenFiscal?: string;
}

interface DraftPayment {
  ID_Payment: number;
  Description: string;
  Monto: number;
  ReferenceNumber: string;
}

interface PaymentMethod { ID_Payment: number; Description: string }

const money = (value: unknown) => Number(value ?? 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function CajasPays({ ID_Sale }: { ID_Sale: number }) {
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [draftPayments, setDraftPayments] = useState<DraftPayment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const saleQuery = useQuery({ queryKey: ["sale", ID_Sale], queryFn: () => getSaleById(ID_Sale), enabled: Number(ID_Sale) > 0 });
  const methodsQuery = useQuery({ queryKey: ["payments"], queryFn: getPayments });
  const data = saleQuery.data;
  const methods: PaymentMethod[] = methodsQuery.data?.data ?? [];

  const customer: CustomerFormData | null = data?.Cliente?.ID_User ? {
    ID_User: data.Cliente.ID_User,
    Name: data.Cliente.Name ?? "",
    Phone: data.Cliente.Phone?.Description ?? "",
    Email: data.Cliente.Email?.Description ?? "",
    RazonSocial: data.Facturacion?.RazonSocial ?? "",
    CodigoPostal: data.Facturacion?.CodigoPostal ?? "",
    Rfc: data.Facturacion?.Rfc ?? "",
    RegimenFiscal: data.Facturacion?.RegimenFiscal ?? "",
  } : null;

  const currentBalance = Number(data?.Balance_Total ?? 0);
  const draftTotal = useMemo(() => draftPayments.reduce((sum, payment) => sum + payment.Monto, 0), [draftPayments]);
  const remaining = Math.max(0, currentBalance - draftTotal);
  const isPaid = data?.Pagada === "Pagada" || currentBalance <= 0;

  const paymentMutation = useMutation({
    mutationFn: postPaymentSale,
    onSuccess: async (result) => {
      toast.success(result.message || "Pago registrado correctamente");
      setDraftPayments([]); setPaymentMethod(""); setAmount(""); setReference("");
      await queryClient.invalidateQueries({ queryKey: ["sale", ID_Sale] });
      await queryClient.invalidateQueries({ queryKey: ["sale"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const customerCreateMutation = useMutation({
    mutationFn: postCustomerWithSale,
    onSuccess: async () => { toast.success("Cliente asignado correctamente"); await queryClient.invalidateQueries({ queryKey: ["sale", ID_Sale] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const customerUpdateMutation = useMutation({
    mutationFn: putCustomerSale,
    onSuccess: async () => { toast.success("Cliente actualizado correctamente"); await queryClient.invalidateQueries({ queryKey: ["sale", ID_Sale] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const emailMutation = useMutation({ mutationFn: sendTicket, onSuccess: () => toast.success("Ticket de venta enviado por correo"), onError: (error: Error) => toast.error(error.message) });

  const addPayment = () => {
    const numericAmount = Number(amount);
    if (!paymentMethod || !Number.isFinite(numericAmount) || numericAmount <= 0) return toast.warn("Selecciona un método e ingresa un monto mayor a cero.");
    if (Math.round(numericAmount * 100) > Math.round(remaining * 100)) return toast.warn("El monto no puede superar el saldo pendiente.");
    const method = methods.find((item) => item.ID_Payment === Number(paymentMethod));
    if (!method) return toast.error("El método seleccionado no está disponible.");
    setDraftPayments((previous) => [...previous, { ID_Payment: method.ID_Payment, Description: method.Description, Monto: numericAmount, ReferenceNumber: reference.trim() }]);
    setPaymentMethod(""); setAmount(""); setReference("");
  };

  const savePayments = () => {
    if (!draftPayments.length) return toast.warn("Agrega al menos un pago nuevo.");
    paymentMutation.mutate({ ID_Sale, Payment: draftPayments });
  };

  const saveCustomer = (form: CustomerFormData) => {
    const payload = { ...form, ID_Sale };
    if (form.ID_User) customerUpdateMutation.mutate(payload);
    else customerCreateMutation.mutate(payload);
  };

  if (saleQuery.isLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">Cargando venta…</div>;
  if (saleQuery.isError || !data) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">No fue posible cargar la venta.</div>;

  return (
    <div className="w-full min-w-0 space-y-5">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="font-mono text-sm font-bold text-[#c70063]">Venta {formatFolio(ID_Sale)}</p><h2 className="text-2xl font-black text-slate-900">Registrar abono</h2><p className="text-sm text-slate-500">Captura únicamente el dinero recibido en este momento.</p></div>
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{isPaid ? "Liquidada" : "Saldo pendiente"}</span>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Total de venta</p><p className="text-xl font-black text-slate-900">{money(data.Total)}</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Pagado anteriormente</p><p className="text-xl font-black text-slate-900">{money(Number(data.Total) - currentBalance)}</p></div>
        <div className="rounded-2xl bg-[#c70063]/5 p-4"><p className="text-sm text-[#9d004e]">Saldo actual</p><p className="text-2xl font-black text-[#c70063]">{money(currentBalance)}</p></div>
      </section>

      <section className="rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>{customer ? <><p className="text-xs font-bold uppercase tracking-wide text-[#007782]">Cliente</p><p className="font-bold text-slate-900">{customer.Name}</p><p className="text-sm text-slate-500">{customer.Email}</p></> : <><p className="font-bold text-slate-900">Sin cliente asignado</p><p className="text-sm text-slate-500">Asigna uno para enviar el comprobante por correo.</p></>}</div>
          <button type="button" onClick={() => setModalOpen(true)} className="rounded-xl border border-[#007782]/30 px-4 py-2.5 font-bold text-[#007782] hover:bg-[#007782]/5">{customer ? "Editar cliente" : "Asignar cliente"}</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3"><h3 className="font-bold text-slate-900">Productos de la venta</h3></div>
        <div className="divide-y divide-slate-100">{(data.SaleProduct ?? []).map((item: any) => <div key={item.ID_SaleProduct} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm"><div><p className="font-semibold text-slate-800">{item.Product?.Description} · {item.Stock?.Description}</p><p className="text-slate-500">{item.Quantity} × {money(item.Saleprice)}</p></div><p className="font-bold">{money(Number(item.Quantity) * Number(item.Saleprice))}</p></div>)}</div>
      </section>

      {!isPaid && <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
        <div className="mb-4"><p className="text-xs font-bold uppercase tracking-wide text-[#c70063]">Nuevo abono</p><h3 className="font-bold text-slate-900">¿Cómo recibió el pago?</h3></div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">Método<select value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value); setAmount(remaining.toFixed(2)); }} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"><option value="">Seleccionar</option>{methods.map((method) => <option key={method.ID_Payment} value={method.ID_Payment}>{method.Description}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Monto<input type="number" min="0.01" step="0.01" max={remaining} value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="0.00" /></label>
          <label className="text-sm font-semibold text-slate-700">Referencia o nota<input value={reference} maxLength={120} onChange={(event) => setReference(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" placeholder="Opcional" /></label>
        </div>
        <button type="button" onClick={addPayment} disabled={!paymentMethod || !amount} className="mt-4 rounded-xl bg-[#007782] px-4 py-2.5 font-bold text-white disabled:opacity-40">Agregar al abono</button>
      </section>}

      {draftPayments.length > 0 && <section className="rounded-2xl border border-[#c70063]/20 bg-[#c70063]/[0.03] p-4 sm:p-5"><h3 className="font-bold text-slate-900">Pagos por registrar</h3><div className="mt-3 space-y-2">{draftPayments.map((payment, index) => <div key={`${payment.ID_Payment}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"><div><p className="font-semibold">{payment.Description}</p><p className="text-xs text-slate-500">{payment.ReferenceNumber || "Sin referencia"}</p></div><div className="flex items-center gap-3"><strong>{money(payment.Monto)}</strong><button type="button" onClick={() => setDraftPayments((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="text-sm font-semibold text-red-600">Quitar</button></div></div>)}</div><div className="mt-4 flex justify-between border-t border-[#c70063]/10 pt-3"><span>Saldo después del abono</span><strong>{money(remaining)}</strong></div></section>}

      {(data.PaymentSale?.length ?? 0) > 0 && <details className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer font-bold text-slate-800">Historial de pagos ({data.PaymentSale.length})</summary><div className="mt-3 divide-y divide-slate-100">{data.PaymentSale.map((payment: any) => <div key={payment.ID_PaymentSale} className="flex justify-between gap-3 py-2 text-sm"><div><p className="font-semibold">{payment.Payment?.Description ?? payment.Description}</p><p className="text-slate-500">{payment.ReferenceNumber || "Sin referencia"}</p></div><strong>{money(payment.Monto)}</strong></div>)}</div></details>}

      <footer className="grid gap-2 border-t border-slate-200 pt-5 sm:grid-cols-[auto_auto_1fr]">
        <button type="button" onClick={() => openTicket(ID_Sale).catch(() => toast.error("No fue posible abrir el ticket"))} className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700">Imprimir ticket</button>
        <button type="button" onClick={() => emailMutation.mutate(ID_Sale)} disabled={!customer?.Email || emailMutation.isPending} className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 disabled:opacity-40">Enviar por correo</button>
        <button type="button" onClick={savePayments} disabled={!draftPayments.length || paymentMutation.isPending || isPaid} className="rounded-xl bg-[#c70063] px-5 py-3 font-black text-white disabled:opacity-40 sm:justify-self-end">{paymentMutation.isPending ? "Registrando…" : remaining === 0 && draftPayments.length ? "Liquidar venta" : `Registrar abono de ${money(draftTotal)}`}</button>
      </footer>

      {modalOpen && <ModalCustomers onClose={() => setModalOpen(false)} onSave={saveCustomer} onEdit={customer?.ID_User} />}
    </div>
  );
}

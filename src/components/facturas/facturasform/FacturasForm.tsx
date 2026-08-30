import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  downloadFacturaPDF,
  downloadFacturaXML,
  getFacturacionSaleById,
  invoiceSaleFromGlobal,
  postFactura,
  sendFacturaEmail,
  validateFactura,
} from "../../../api/Post/FacturacionApi/FacturacionApi";
import { SAT_CFDI_USES, SAT_FISCAL_REGIMES, SAT_PAYMENT_FORMS, SAT_PAYMENT_METHODS } from "../../../constants/satCatalogs";

interface Iva {
  Description: string;
  Iva: number;
}

interface Product {
  Description: string;
  Code: string;
  Iva: Iva;
}

interface Stock {
  Description: string;
  Code: string;
  Purchaseprice: number;
  Saleprice: number;
}

interface Item {
  ID_Product?: number;
  Quantity: number;
  Product: Product;
  Stock: Stock;
  Saleprice: number;
}

const FacturaForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issued, setIssued] = useState<{ uuid: string; serie?: string; folio?: string } | null>(null);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [preflight, setPreflight] = useState<{ ready: boolean; issues: string[]; warnings: string[]; checks: { key: string; label: string; ok: boolean }[] } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState<number | null>(null);
  const [debouncedTicket, setDebouncedTicket] = useState<number | null>(null);
  const [pago, setPago] = useState({
    formaPago: "01",
    metodoPago: "PUE",
  });

  const [receptor, setReceptor] = useState({
    rfc: "",
    razonsocial: "",
    usoCFDI: "",
    regimenFiscal: "",
    codigopostal: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTicket(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["facturacionbyid", debouncedTicket],
    queryFn: () => getFacturacionSaleById(debouncedTicket),
    enabled: !!debouncedTicket,
  });

  useEffect(() => {
    if (data?.Facturacion) {
      setReceptor({
        rfc: data.Facturacion.Rfc || "",
        razonsocial: data.Facturacion.RazonSocial || "",
        codigopostal: data.Facturacion.CodigoPostal || "",
        regimenFiscal: data.Facturacion.RegimenFiscal || "",
        usoCFDI: "S01",
      });
    }
  }, [data]);

  const hasData = data && data.SaleProduct && data.SaleProduct.length > 0;

  const subtotal = data?.Subtotal;
  const iva = data?.Iva;
  const total = data?.Total;

  const buildPayload = () => ({
    ID_Sale: data?.ID_Sale,
    RFC: receptor.rfc, RazonSocial: receptor.razonsocial, CodigoPostal: receptor.codigopostal,
    RegimenFiscal: receptor.regimenFiscal, UsoCFDI: receptor.usoCFDI,
    FormaPago: pago.formaPago, MetodoPago: pago.metodoPago,
    Subtotal: subtotal, Iva: iva, Total: total, Items: data?.SaleProduct,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasData) return;
    // Aquí va el timbrado
    if (!preflight?.ready) return toast.error("Corrige la validación previa antes de timbrar");
    const datafactura = buildPayload();


    try {
      setIsSubmitting(true);
      const result = data?.GlobalInvoiceMembership && data.GlobalInvoiceMembership.ExtractionStatus !== "COMPLETED"
        ? await invoiceSaleFromGlobal(Number(data.ID_Sale), datafactura as never)
        : await postFactura(datafactura!);
      if (result.completed === false) {
        toast.info(result.message || "La cancelación global quedó pendiente de aceptación");
        await refetch();
        return;
      }
      const emitted = result.invoice || result;
      setIssued({ uuid: emitted.UUID || emitted.uuid, serie: emitted.Serie || emitted.serie, folio: emitted.Folio || emitted.folio });
      setEmailRecipient(data?.Cliente?.Email?.Description || "");
      toast.success("Factura emitida correctamente");
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible emitir la factura");
    } finally {
      setIsSubmitting(false);
    }
  };


  const formularioIncompleto =
    !receptor.rfc.trim() ||
    !receptor.razonsocial.trim() ||
    !receptor.codigopostal.trim() ||
    !receptor.regimenFiscal ||
    !receptor.usoCFDI ||
    !pago.formaPago ||
    !pago.metodoPago;

  useEffect(() => {
    if (!hasData || formularioIncompleto || issued) { setPreflight(null); return; }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setIsValidating(true);
        const result = await validateFactura(buildPayload() as never);
        if (active) setPreflight(result);
      } catch (error) {
        if (active) setPreflight({ ready: false, issues: [error instanceof Error ? error.message : "No fue posible validar"], warnings: [], checks: [] });
      } finally { if (active) setIsValidating(false); }
    }, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [data?.ID_Sale, receptor.rfc, receptor.razonsocial, receptor.codigopostal, receptor.regimenFiscal, receptor.usoCFDI, pago.formaPago, pago.metodoPago, hasData, formularioIncompleto, issued]);

  const yaTimbrado = Boolean(
    data?.FacturacionTicket?.some(
      (factura: { Status?: string; UUID?: string; Estado?: boolean }) =>
        factura.Status === "STAMPED" || Boolean(factura.UUID) || factura.Estado === true
    )
  );
  const globalMembership = data?.GlobalInvoiceMembership;
  const globalPending = Boolean(globalMembership && globalMembership.ExtractionStatus !== "COMPLETED");

  const disable = formularioIncompleto || yaTimbrado || isValidating || !preflight?.ready;



  const ticketValido = typeof debouncedTicket === "number" && debouncedTicket > 0;

  const handleInvoiceEmail = async () => {
    if (!issued?.uuid) return;
    try {
      setIsSendingEmail(true);
      const result = await sendFacturaEmail(issued.uuid, emailRecipient);
      toast.success(result.message || "Factura enviada correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible enviar la factura");
    } finally { setIsSendingEmail(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0">
      <div className="mb-7"><p className="text-sm font-semibold text-[#c70063]">Facturación</p><h2 className="text-2xl font-bold text-slate-900">Emitir factura</h2><p className="text-sm text-slate-500">Busca una venta, verifica los datos fiscales y emite el comprobante.</p></div>

      {issued && <section className="mb-7 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">CFDI timbrado</span><h3 className="mt-3 text-2xl font-bold text-slate-900">La factura está lista</h3><p className="mt-1 text-sm text-slate-600">Folio {issued.serie}{issued.folio} · Los documentos fiscales ya pueden descargarse o enviarse.</p><button type="button" onClick={() => navigator.clipboard.writeText(issued.uuid).then(() => toast.success("UUID copiado"))} className="mt-3 break-all text-left font-mono text-xs text-[#007782] hover:underline">UUID: {issued.uuid}</button></div><div className="grid min-w-[260px] grid-cols-2 gap-2"><button type="button" onClick={() => downloadFacturaPDF(issued.uuid)} className="rounded-lg bg-[#c70063] px-4 py-3 font-bold text-white">Descargar PDF</button><button type="button" onClick={() => downloadFacturaXML(issued.uuid)} className="rounded-lg border border-[#007782]/25 bg-white px-4 py-3 font-bold text-[#007782]">Descargar XML</button></div></div>
        <div className="mt-5 border-t border-emerald-200 pt-4"><p className="text-sm font-bold text-slate-800">Enviar PDF y XML por correo</p><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input type="email" value={emailRecipient} onChange={e => setEmailRecipient(e.target.value)} placeholder="cliente@correo.com" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3"/><button type="button" disabled={isSendingEmail || !emailRecipient.trim()} onClick={handleInvoiceEmail} className="rounded-lg bg-[#007782] px-5 py-3 font-bold text-white disabled:opacity-50">{isSendingEmail ? "Enviando…" : "Enviar factura"}</button></div></div>
      </section>}

      {/* =======================
         DATOS DEL TICKET
         ======================= */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
          1. Buscar venta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Número de Ticket
            </label>

            <input
              type="number"
              min="1"
              placeholder="Número de ticket"
              aria-label="Número de ticket"
              value={searchTerm !== null ? String(searchTerm) : ""}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className={`
              w-full rounded-md border px-3 py-2 text-sm transition
              focus:outline-none focus:ring-2
              ${
                yaTimbrado
                  ? "border-yellow-400 focus:ring-yellow-400 focus:border-yellow-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }
            `}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Estado
            </label>

            {/* 🔄 BUSCANDO TICKET */}
            {isFetching && (
              <div className="flex items-center gap-2 rounded-xl border border-[#007782]/25 bg-[#007782]/5 px-3 py-2 text-[#00636c]">
                <span className="text-blue-600 text-sm animate-spin">🔄</span>
                <div className="text-sm text-blue-800">
                  Buscando información del ticket…
                </div>
              </div>
            )}

            {/* ❌ TICKET NO ENCONTRADO */}
            {!isFetching && ticketValido  && !hasData && (
              <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2">
                <span className="text-red-600 text-sm">❌</span>
                <div className="text-sm text-red-800">
                  No se encontró información para este ticket.
                </div>
              </div>
            )}

            {/* ⚠️ YA TIMBRADO */}
            {yaTimbrado  && (
              <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2">
                <span className="text-yellow-600 text-sm">⚠️</span>
                <div className="text-sm text-yellow-800">
                  Este ticket <strong>ya fue timbrado</strong>
                </div>
              </div>
            )}

            {/* ✅ LISTO PARA TIMBRAR */}
            {!isFetching && hasData && !yaTimbrado && (
              <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-3 py-2">
                <span className="text-green-600 text-sm">✅</span>
                <div className="text-sm text-green-800">
                  {globalPending ? <>Incluido en una <strong>factura global</strong>; se aplicará el flujo SAT</> : <>Ticket <strong>válido</strong>, listo para timbrar</>}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* =======================
         SOLO SE MUESTRA SI HAY DATA
         ======================= */}
      {hasData && (
        <>
          {globalPending && <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:p-5"><p className="font-bold">Venta incluida en factura global</p><p className="mt-1">El sistema cancelará la global con motivo 04, emitirá una global corregida sin esta venta y finalmente timbrará la factura individual. Si el SAT deja la cancelación pendiente, podrás continuar después sin duplicar comprobantes.</p>{globalMembership.ExtractionStatus && <p className="mt-2 text-xs font-semibold">Etapa actual: {globalMembership.ExtractionStatus}</p>}</section>}
          {/* DATOS DEL RECEPTOR */}
          <section className="mb-7 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
              2. Datos fiscales del receptor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  RFC
                </label>
                <input
                  required
                  value={receptor.rfc || ""}
                  onChange={(e) =>
                    setReceptor({
                      ...receptor,
                      rfc: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Razón Social
                </label>
                <input
                  required
                  value={receptor.razonsocial || ""}
                  onChange={(e) =>
                    setReceptor({ ...receptor, razonsocial: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Código Postal Fiscal
                </label>
                <input
                  required
                  value={receptor.codigopostal || ""}
                  onChange={(e) =>
                    setReceptor({ ...receptor, codigopostal: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Régimen Fiscal
                </label>
                <select
                  value={receptor.regimenFiscal || ""}
                  onChange={(e) =>
                    setReceptor({
                      ...receptor,
                      regimenFiscal: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona régimen fiscal</option>
                  {SAT_FISCAL_REGIMES.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Uso CFDI
                </label>
                <select
                  value={receptor.usoCFDI}
                  onChange={(e) =>
                    setReceptor({ ...receptor, usoCFDI: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona</option>
                  {SAT_CFDI_USES.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* DATOS DE PAGO */}
          <section className="mb-7 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
              3. Datos del pago
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Forma de Pago
                </label>
                <select
                  value={pago.formaPago}
                  onChange={(e) =>
                    setPago({ ...pago, formaPago: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SAT_PAYMENT_FORMS.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Método de Pago
                </label>
                <select
                  value={pago.metodoPago}
                  onChange={(e) =>
                    setPago({ ...pago, metodoPago: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SAT_PAYMENT_METHODS.map(([code, label]) => <option key={code} value={code}>{code} - {label}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* CONCEPTOS */}
          <section className="mb-7 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
              4. Conceptos
            </h3>

            <div className="space-y-2">
              {data?.SaleProduct?.map((item: Item, i: number) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-2 text-sm sm:grid-cols-4">
                  <input
                    disabled
                    className="rounded-md border border-gray-300 px-2 py-1 bg-gray-50"
                    value={`${item.Product.Description} ${item.Stock.Description}`}
                  />
                  <input
                    disabled
                    className="rounded-md border border-gray-300 px-2 py-1 bg-gray-50 text-center"
                    value={item.Quantity}
                  />
                  <input
                    disabled
                    className="rounded-md border border-gray-300 px-2 py-1 bg-gray-50 text-right"
                    value={item.Saleprice}
                  />
                  <input
                    disabled
                    className="rounded-md border border-gray-300 px-2 py-1 bg-gray-50 text-center"
                    value={item.Product.Code}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* TOTALES */}
          <div className="mb-6 ml-auto max-w-sm rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div>Subtotal: ${subtotal}</div>
            <div>IVA: ${iva}</div>
            <div className="text-lg font-bold text-gray-900">
              Total: ${total}
            </div>
          </div>

          {!formularioIncompleto && <section className={`mb-6 rounded-2xl border p-4 ${preflight?.ready ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}>
            <div className="flex items-center justify-between gap-3"><div><p className="font-bold text-slate-900">Validación previa</p><p className="text-xs text-slate-500">Comprobación local; no consume folios de Facturama.</p></div>{isValidating && <span className="text-sm text-[#007782]">Validando…</span>}{!isValidating && preflight && <span className={`rounded-full px-3 py-1 text-xs font-bold ${preflight.ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{preflight.ready ? "Listo para timbrar" : "Requiere atención"}</span>}</div>
            {preflight?.checks?.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{preflight.checks.map(check => <div key={check.key} className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm"><span className={check.ok ? "text-emerald-600" : "text-red-600"}>{check.ok ? "✓" : "×"}</span><span>{check.label}</span></div>)}</div> : null}
            {preflight?.issues?.length ? <ul className="mt-3 space-y-1 text-sm text-red-700">{preflight.issues.map(issue => <li key={issue}>• {issue}</li>)}</ul> : null}
            {preflight?.warnings?.length ? <ul className="mt-3 space-y-1 text-sm text-amber-700">{preflight.warnings.map(warning => <li key={warning}>• {warning}</li>)}</ul> : null}
          </section>}

          <button
            disabled={disable || isSubmitting}
            type="submit"
            className={`
              w-full md:w-auto px-6 py-2 rounded-md text-sm font-semibold transition
              ${
                disable || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#c70063] text-white hover:bg-[#a90054]"
              }
            `}
          >
            {isSubmitting ? "Procesando flujo fiscal..." : globalPending ? (globalMembership.ExtractionStatus === "WAITING_GLOBAL_CANCELLATION" ? "Continuar proceso SAT" : "Extraer de global y facturar") : "Emitir factura"}
          </button>
        </>
      )}
    </form>
  );
};

export default FacturaForm;

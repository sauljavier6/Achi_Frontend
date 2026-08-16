import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getFacturacionSaleById,
  postFactura,
} from "../../../api/Post/FacturacionApi/FacturacionApi";

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
    codigopostal: "S01",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTicket(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isFetching } = useQuery({
    queryKey: ["facturacionbyid", debouncedTicket],
    queryFn: () => getFacturacionSaleById(debouncedTicket),
    enabled: !!debouncedTicket,
    placeholderData: (prev) => prev,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasData) return;
    // Aquí va el timbrado
    const datafactura = {
      ID_Sale: data?.ID_Sale,
      RFC: receptor.rfc,
      RazonSocial: receptor.razonsocial,
      CodigoPostal: receptor.codigopostal,
      RegimenFiscal: receptor.regimenFiscal,
      UsoCFDI: receptor.usoCFDI,
      FormaPago: pago.formaPago,
      MetodoPago: pago.metodoPago,
      Subtotal: subtotal,
      Iva: iva,
      Total: total,
      Items: data?.SaleProduct,
    };


    try {
      setIsSubmitting(true);
      await postFactura(datafactura!);
      toast.success("Factura emitida correctamente");
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

  const yaTimbrado = (data?.FacturacionTicket?.length ?? 0) > 0;

  const disable = formularioIncompleto || yaTimbrado;



  const ticketValido = typeof debouncedTicket === "number" && debouncedTicket > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0">
      <div className="mb-7"><p className="text-sm font-semibold text-[#c70063]">Facturación</p><h2 className="text-2xl font-bold text-slate-900">Emitir factura</h2><p className="text-sm text-slate-500">Busca una venta, verifica los datos fiscales y emite el comprobante.</p></div>

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
                data?.FacturacionTicket
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
                  Ticket <strong>válido</strong>, listo para timbrar
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
                  <option value="601">601 - General de Ley</option>
                  <option value="612">
                    612 - Personas Físicas con Actividades Empresariales
                  </option>
                  <option value="616">616 - Sin obligaciones fiscales</option>
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
                  <option value="G03">G03 - Gastos en general</option>
                  <option value="S01">S01 - Sin efectos fiscales</option>
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
                  <option value="01">01 - Efectivo</option>
                  <option value="03">03 - Transferencia</option>
                  <option value="04">04 - Tarjeta</option>
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
                  <option value="PUE">PUE - Pago en una sola exhibición</option>
                  <option value="PPD">PPD - Pago en parcialidades</option>
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
            {isSubmitting ? "Emitiendo factura..." : "Emitir factura"}
          </button>
        </>
      )}
    </form>
  );
};

export default FacturaForm;

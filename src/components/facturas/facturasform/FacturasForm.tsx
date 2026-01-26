import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

    console.log("receptor:", receptor);

    await postFactura(datafactura!);
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

  console.log("disable:", disable);
  console.log("formularioIncompleto:", formularioIncompleto);
  console.log("yaTimbrado:", yaTimbrado);

  console.log("VALIDACIÓN CAMPOS", {
    rfc: receptor.rfc,
    razonsocial: receptor.razonsocial,
    codigopostal: receptor.codigopostal,
    regimenFiscal: receptor.regimenFiscal,
    usoCFDI: receptor.usoCFDI,
    formaPago: pago.formaPago,
    metodoPago: pago.metodoPago,
  });

  const ticketValido = typeof debouncedTicket === "number" && debouncedTicket > 0;

  return (
    <form onSubmit={handleSubmit} className="mx-auto bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Facturar Ticket
      </h2>

      {/* =======================
         DATOS DEL TICKET
         ======================= */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
          Datos del Ticket
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Número de Ticket
            </label>

            <input
              type="number"
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
              <div className="flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-3 py-2">
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
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
              Datos del Receptor
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
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
              Datos de Pago
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
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
              Conceptos
            </h3>

            <div className="space-y-2">
              {data?.SaleProduct?.map((item: Item, i: number) => (
                <div key={i} className="grid grid-cols-4 gap-2 text-sm">
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
          <div className="text-right text-sm text-gray-700 mb-6">
            <div>Subtotal: ${subtotal}</div>
            <div>IVA: ${iva}</div>
            <div className="text-lg font-bold text-gray-900">
              Total: ${total}
            </div>
          </div>

          <button
            disabled={disable}
            type="submit"
            className={`
              w-full md:w-auto px-6 py-2 rounded-md text-sm font-semibold transition
              ${
                disable
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            Timbrar Factura
          </button>
        </>
      )}
    </form>
  );
};

export default FacturaForm;

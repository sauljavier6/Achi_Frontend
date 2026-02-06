import { useState } from "react";
import { downloadFacturaPDF, getFacturas } from "../../../api/Post/FacturacionApi/FacturacionApi";
import { useQuery } from "@tanstack/react-query";

interface Sale {
  createdAt: string;
  Total: number;  
}

interface Factura {
  ID_FacturacionTicket: number;
  ID_Sale: number;
  UUID: string;
  Folio_SAT: string;
  Estado: boolean;
  Sale: Sale; 
}

interface FacturasListProps {
  searchTerm: string;
}

const FacturasList = ({ searchTerm }: FacturasListProps) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data } = useQuery({
    queryKey: ["facturaslist", page, limit, searchTerm],
    queryFn: () => getFacturas({ page, limit, searchTerm }),
    placeholderData: (prev) => prev,
  });

  const facturas = data?.data || [];

  const handleCreateFactura = async (uuid: string) => {
    await downloadFacturaPDF(uuid);
  }

  return (
    <>
    <div className="overflow-x-auto border rounded-md shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-2 py-2">#Venta</th>
            <th className="px-2 py-2">Fecha</th>
            <th className="px-2 py-2">Total</th>
            <th className="px-2 py-2">UUID</th>
            <th className="px-2 py-2">Folio SAT</th>
            <th className="px-2 py-2">Estado</th>
            <th className="px-2 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {facturas.map((factura: Factura) => (
            <tr
              key={factura.ID_FacturacionTicket}
              className="border-t hover:bg-gray-50 cursor-pointer"
            >
              {/* ID_Sale */}
              <td className="px-2 py-2">{factura.ID_Sale}</td>

              {/* Fecha de la venta (viene desde Sale) */}
              <td className="px-2 py-2">
                {factura.Sale?.createdAt
                  ? new Date(factura.Sale.createdAt).toLocaleDateString()
                  : "—"}
              </td>

              {/* Total */}
              <td className="px-2 py-2">${factura.Sale?.Total ?? "0.00"}</td>

              {/* UUID */}
              <td className="px-2 py-2">{factura.UUID || "—"}</td>

              {/* Folio SAT */}
              <td className="px-2 py-2">{factura.Folio_SAT || "—"}</td>

              {/* Estado */}
              <td className="px-2 py-2">
                {factura.Estado ? (
                  <span className="text-green-600 font-semibold">Timbrado</span>
                ) : (
                  <span className="text-red-600 font-semibold">Pendiente</span>
                )}
              </td>

              {/* Acciones */}
              <td className="px-2 py-2">
                <button
                  onClick={() => handleCreateFactura(factura.UUID)}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <img
                    src="/icons/expediente.png"
                    alt="Detalle"
                    className="w-4 h-4"
                  />
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
        <div className="flex justify-end items-center mt-4 space-x-2">
      <button
        disabled={page === 1}
        onClick={() => setPage((old) => Math.max(old - 1, 1))}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center justify-center"
      >
        <img src="/icons/flecha-negra.png" alt="Anterior" className="w-4 h-4" />
      </button>

      {data && data.totalPages >= 1 && (
        <>
          {(() => {
            const maxButtons = 5;
            let start = Math.max(1, page - Math.floor(maxButtons / 2));
            let end = start + maxButtons - 1;

            if (end > data.totalPages) {
              end = data.totalPages;
              start = Math.max(1, end - maxButtons + 1);
            }

            return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1 rounded ${
                  page === num
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {num}
              </button>
            ));
          })()}
        </> 
      )}

      <button
        disabled={page >= (data?.totalPages || 1)}
        onClick={() => setPage((old) => old + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 flex items-center justify-center"
      >
        <img src="/icons/flecha-negra.png" alt="Siguiente" className="w-4 h-4 transform rotate-180" />
      </button>
    </div>
    </>
  );
};

export default FacturasList;

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getQuotes } from "../../../../api/Post/QuotesApi/QuotesApi";
import { formatFolio } from "../../../../utils/folio";

interface QuoteUser { ID_User: number; Name: string; }
interface QuoteRow {
  ID_Sale: number;
  ID_User?: number | null;
  Total: number | string;
  Balance_Total: number | string;
  ID_Operador?: number | null;
  Batch?: string;
  user?: QuoteUser | null;
  operator?: QuoteUser | null;
  DocumentStatus?: string;
  ConvertedSaleId?: number | null;
}

interface QuoteListProps {
  onSelected: (ids: number[]) => void;
  resetChecks: boolean;
  onResetComplete: () => void;
  searchTerm: string;
}

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export default function QuotesList({ onSelected, resetChecks, onResetComplete, searchTerm }: QuoteListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["quotes", page, limit, searchTerm],
    queryFn: () => getQuotes({ page, limit, searchTerm }),
    placeholderData: (previous) => previous,
  });
  const rows: QuoteRow[] = data?.data ?? [];

  useEffect(() => { setPage(1); setSelectedIds([]); }, [searchTerm]);
  useEffect(() => { onSelected(selectedIds); }, [selectedIds, onSelected]);
  useEffect(() => {
    if (resetChecks) {
      setSelectedIds([]);
      onResetComplete();
    }
  }, [resetChecks, onResetComplete]);

  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.ID_Sale));

  return (
    <div className="min-w-0">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead>
            <tr>
              <th className="w-12"><input aria-label="Seleccionar todas las cotizaciones" type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : rows.map((row) => row.ID_Sale))} /></th>
              <th>Folio</th><th>Cliente</th><th>Total</th><th>Operador</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((quote) => (
              <tr key={quote.ID_Sale} onClick={() => setSelectedIds([quote.ID_Sale])} className={`cursor-pointer ${selectedIds.includes(quote.ID_Sale) ? "bg-[#c70063]/5" : ""}`}>
                <td><input aria-label={`Seleccionar cotización ${quote.ID_Sale}`} type="checkbox" checked={selectedIds.includes(quote.ID_Sale)} onChange={() => setSelectedIds((current) => current.includes(quote.ID_Sale) ? current.filter((id) => id !== quote.ID_Sale) : [...current, quote.ID_Sale])} onClick={(event) => event.stopPropagation()} /></td>
                <td><span className="font-mono font-bold text-slate-900">{formatFolio(quote.ID_Sale)}</span></td>
                <td>{quote.user?.Name || <span className="text-slate-400">Público general</span>}</td>
                <td className="font-semibold text-slate-900">{currency.format(Number(quote.Total) || 0)}</td>
                <td>{quote.operator?.Name || <span className="text-slate-400">Sin asignar</span>}</td>
                <td>{quote.DocumentStatus === "CONVERTED" ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Venta {formatFolio(quote.ConvertedSaleId)}</span> : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Activa</span>}</td>
                <td><button type="button" disabled={quote.DocumentStatus === "CONVERTED" || Boolean(quote.ConvertedSaleId)} onClick={(event) => { event.stopPropagation(); window.location.assign(`/pos/cajas?quote=${quote.ID_Sale}`); }} className="rounded-xl border border-[#007782]/30 px-3 py-2 text-xs font-bold text-[#007782] hover:bg-[#007782]/5 disabled:cursor-not-allowed disabled:opacity-40">Convertir en venta</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-sm text-slate-500">Cargando cotizaciones…</div>}
        {isError && <div className="p-8 text-center text-sm text-red-600">{error instanceof Error ? error.message : "No fue posible cargar las cotizaciones"}</div>}
        {!isLoading && !isError && rows.length === 0 && <div className="p-10 text-center"><p className="font-semibold text-slate-700">No hay cotizaciones</p><p className="mt-1 text-sm text-slate-500">Crea una nueva o cambia el criterio de búsqueda.</p></div>}
      </div>

      {(data?.totalPages ?? 1) > 1 && <div className="mt-4 flex items-center justify-end gap-2">
        <button aria-label="Página anterior" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">←</button>
        <span className="px-2 text-sm text-slate-600">Página {page} de {data.totalPages}</span>
        <button aria-label="Página siguiente" disabled={page >= data.totalPages} onClick={() => setPage((current) => current + 1)} className="border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">→</button>
      </div>}
    </div>
  );
}

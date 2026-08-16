
import { useState } from "react";
import QuotesList from "../../components/sales/quotes/quoteslist/QuotesList";
import CajasQuotes from "../../components/sales/quotes/cajaquotes/CajaQuotes";
import { useAuth } from "../../hooks/useAuth";

const QuotesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cajaOpen, setCajaOpen] = useState(false);
  const [isIDSale, setIsIDSale] = useState<number[]>([]);
  const [resetChecks, setResetChecks] = useState(false);
  const { isAdmin, isTrabajador } = useAuth();

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateQuote = () => {
    setIsIDSale([])
    setCajaOpen(true);
  };

  const handleUpdateQuote = () => {
    setCajaOpen(true);
  };

  return (
    <div>
    {!cajaOpen && (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div><p className="text-sm font-semibold text-[#c70063]">Ventas</p><h1 className="text-2xl font-bold text-slate-900">Cotizaciones</h1><p className="text-sm text-slate-500">Crea propuestas y conviértelas en ventas.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Buscar por folio o cliente"
            aria-label="Buscar cotizaciones"
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateQuote}
            className="rounded-xl bg-[#c70063] px-4 py-2.5 font-semibold text-white hover:bg-[#a90054]"
          >
            Nueva cotización
          </button>
          )}
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleUpdateQuote}
            disabled={isIDSale.length !== 1}
            className={`px-4 py-2 rounded-md font-medium transition-colors 
              ${isIDSale.length !== 1 
                ? 'bg-gray-400 cursor-not-allowed text-gray-100' 
                : 'bg-[#007782] text-white hover:bg-[#00636c]'}`}
          >
            Editar
          </button>
          )}
        </div>
      </div>

       
        <QuotesList onSelected={(id) => setIsIDSale(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>
      
    </section>
    )}

    {cajaOpen && (
      <div className="rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCajaOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100">
            <img
              src="/icons/flecha.png"
              alt="flecha"
              className="w-5 h-5 transform rotate-180"
            />
            <span className="text-sm">Regresar</span>
          </button>
        </div>
        <CajasQuotes ID_Sale={isIDSale[0]} />
      </div>
    )}
  </div>
  );
};

export default QuotesPage;



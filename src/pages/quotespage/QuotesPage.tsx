
import { useState } from "react";
import QuotesList from "../../components/sales/quotes/quoteslist/QuotesList";
import styles from "./QuotesPage.module.scss";
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
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h1 className={styles.title}>Cotizaciones</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Buscar cotizaciones..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateQuote}
            className={styles.buttonCrearProducto}
          >
            Crear
          </button>
          )}
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleUpdateQuote}
            disabled={isIDSale.length !== 1}
            className={`px-4 py-2 rounded-md font-medium transition-colors 
              ${isIDSale.length !== 1 
                ? 'bg-gray-400 cursor-not-allowed text-gray-100' 
                : styles.buttonEditarProducto}`}
          >
            Editar
          </button>
          )}
        </div>
      </div>

       
        <QuotesList onSelected={(id) => setIsIDSale(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>
      
    </div>
    )}

    {cajaOpen && (
      <div className="sm:p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCajaOpen(false)} className="flex items-center gap-2 hover:text-blue-600">
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



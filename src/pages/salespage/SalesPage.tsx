
import { useState } from "react";
import SalesList from "../../components/sales/saleslist/SalesList";
import styles from "./SalesPage.module.scss";
import CajasPays from "../../components/sales/cajaspays/CajasPays";
import { useAuth } from "../../hooks/useAuth";

const VentasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [isIDSale, setIsIDSale] = useState<number[]>([]);
  const [resetChecks, setResetChecks] = useState(false);
  const { isAdmin, isTrabajador } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        {!openModal && (
        <div><p className="text-sm font-semibold text-[#c70063]">Operación</p><h1 className="text-2xl font-bold text-slate-900">Ventas</h1><p className="text-sm text-slate-500">Consulta ventas y registra pagos pendientes.</p></div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {!openModal && (
          <>
            <input
              type="text"
              placeholder="Buscar por folio o cliente"
              aria-label="Buscar ventas"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />
            {(isAdmin || isTrabajador) && (
            <button
              onClick={() => setOpenModal(true)}
              disabled={isIDSale.length !== 1}
              className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200 
                ${isIDSale.length !== 1
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : styles.buttonEditarProducto}
              `}
            >
              Registrar pago
            </button>
            )}
          </>
        )}
        {openModal && (
        <button onClick={() => setOpenModal(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100">
          <img
            src="/icons/flecha.png"
            alt="flecha"
            className="w-5 h-5 transform rotate-180"
          />
          <span className="text-sm">Regresar</span>
        </button>
        )} 
        </div>
      </div>

      {!openModal &&
        <SalesList onSelected={(id) => setIsIDSale(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>
      }
      {openModal &&
      <CajasPays ID_Sale={isIDSale[0]}/>
      }
    </section>
  );
}; 

export default VentasPage;

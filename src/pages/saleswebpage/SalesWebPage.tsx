import { useState } from "react";
import styles from "./SalesWebPage.module.scss";
import SalesWebList from "../../components/salesweb/salesweblist/SalesWebList";
import SalesDetails from "../../components/salesweb/salesdetails/SalesDetails";
import { useAuth } from "../../hooks/useAuth";

const VentasPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isIDSale, setIsIDSale] = useState<number[]>([]);
  const [resetChecks, setResetChecks] = useState(false);
  const { isAdmin, isTrabajador } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        {!openModal && <div><p className="text-sm font-semibold text-[#c70063]">Ecommerce</p><h1 className="text-2xl font-bold text-slate-900">Pedidos web</h1><p className="text-sm text-slate-500">Prepara y da seguimiento a las compras en línea.</p></div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {!openModal && (
            <>
              <input
                type="text"
                placeholder="Buscar pedido"
                aria-label="Buscar pedidos web"
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 border border-gray-300 rounded-md w-full"
              />
              {(isAdmin || isTrabajador) && (
              <button
                onClick={() => setOpenModal(true)}
                disabled={isIDSale.length !== 1}
                className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200 
                ${
                  isIDSale.length !== 1
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : styles.buttonEditarProducto
                }
              `}
              >
                Preparar pedido
              </button>
              )}
            </>
          )}
          {openModal && (
            <button
              onClick={() => setOpenModal(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100"
            >
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

      {!openModal && (
        <SalesWebList
          onSelected={(id) => setIsIDSale(id)}
          resetChecks={resetChecks}
          onResetComplete={() => setResetChecks(false)}
          searchTerm={searchTerm}
        />
      )}
      {openModal && 
      <SalesDetails 
        sale={isIDSale[0]}
        onCompleted={() => {
          setOpenModal(false);
          setIsIDSale([]);
          setResetChecks(true);
        }}
      />}
    </section>
  );
};

export default VentasPage;

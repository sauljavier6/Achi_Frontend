import { useState } from "react";
import styles from "./CajasPage.module.scss";
import CajasList from "../../components/cajas/cajaslist/CajasList";
import ModalCajas from "../../components/cajas/modalcajas/ModalCajas";
import Cajas from "../../components/cajas/cajas/Cajas";
import DetallesCaja from "../../components/cajas/detallescajas/DetallesCajas";
import SalesByBatchList from "../../components/cajas/salesbybatchlist/SalesByBatchList";
import { useAuth } from "../../hooks/useAuth";

const CajasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [openCajas, setOpenCajas] = useState(false);
  const [openCajasDetalles, setOpenCajasDetalles] = useState(false);
  const [loteSelected, setLoteSelected] = useState<string>("");
  const [edit, setEdit] = useState<number>();
  const [resetChecks, setResetChecks] = useState(false);
  const { isAdmin, isTrabajador } = useAuth();

  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpen = () => {
    setEdit(undefined);
    setModalOpen(true);
  };
  
  const handleOpenEdit = () => {
    setModalOpen(true);
  };
  

  const handleOpenCaja = (Lote: string) => {
    setLoteSelected(Lote);
    setOpenCajas(true);
  };

  const handleOpenBatch = (ID_Batch: number) => {
    setEdit(ID_Batch);
  };

  return (
    <div>
      {!openCajas && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h1 className={styles.title}>Cajas</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Buscar lote..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 border border-gray-300 rounded-md w-full"
              />
              {(isAdmin || isTrabajador) && (
              <button
                onClick={handleOpen}
                className={styles.buttonCrearProducto}
              >
                Crear Lote
              </button>
              )}
              {(isAdmin || isTrabajador) && (
              <button
                onClick={handleOpenEdit}
                disabled={!edit}
                className={`px-4 py-2 rounded font-semibold text-white transition-colors duration-200 
                  ${!edit
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                    : styles.buttonEditarProducto}
                `}
              >
                Corte
              </button>
              )}
            </div>
          </div>

          <CajasList openCaja={handleOpenCaja} openBatch={handleOpenBatch} resetChecks={resetChecks} 
          onResetComplete={() => {setResetChecks(false);
                                 setEdit(undefined);} }
          searchTerm={searchTerm}
          />

          {modalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ModalCajas
                onClose={() => {
                  setModalOpen(false);
                  setEdit(undefined);
                  setResetChecks(true);
                }}
                onEdit={edit}
              />
            </div>
          )}
        </div>
      )}
      {openCajas && (
        <div className="sm:p-4 bg-gray-50 rounded-lg shadow-sm">
          <div className="p-1 flex items-center justify-between mb-4">
            <button
              onClick={() => setOpenCajas(false)}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <img
                src="/icons/flecha.png"
                alt="flecha"
                className="w-5 h-5 transform rotate-180"
              />
              <span className="text-sm">Regresar</span>
            </button>
            <h2
              onClick={() => setOpenCajasDetalles(!openCajasDetalles)}
              className="text-lg font-semibold text-gray-800 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <img
                  src="/icons/flecha.png"
                  alt="icono detalles"
                  className="w-5 h-5"
                />
                {openCajasDetalles ? (
                  <span className="text-sm">Caja</span>
                ) : (
                  <span className="text-sm">Detalles</span>
                )}
              </div>
            </h2>
          </div>

          {!openCajasDetalles && <Cajas Lote={loteSelected} />}

          {openCajasDetalles && (
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="md:w-full">
                <DetallesCaja Lote={loteSelected} />
              </div>

              <div className="md:w-full">
                <SalesByBatchList Lote={loteSelected} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CajasPage;

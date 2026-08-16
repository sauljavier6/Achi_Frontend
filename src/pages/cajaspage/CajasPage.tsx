import { useState } from "react";
import CajasList from "../../components/cajas/cajaslist/CajasList";
import ModalCajas from "../../components/cajas/modalcajas/ModalCajas";
import Cajas from "../../components/cajas/cajas/Cajas";
import DetallesCaja from "../../components/cajas/detallescajas/DetallesCajas";
import SalesByBatchList from "../../components/cajas/salesbybatchlist/SalesByBatchList";
import { useAuth } from "../../hooks/useAuth";
import { ArrowLeft, BarChart3, Plus, ShoppingCart } from "lucide-react";

const CajasPage = () => {
  const pendingQuoteId = Number(new URLSearchParams(window.location.search).get("quote") || 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [openCajas, setOpenCajas] = useState(false);
  const [openCajasDetalles, setOpenCajasDetalles] = useState(false);
  const [loteSelected, setLoteSelected] = useState<string>("");
  const [edit, setEdit] = useState<number>();
  const { isAdmin, isTrabajador } = useAuth();

  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpen = () => {
    setEdit(undefined);
    setModalOpen(true);
  };
  
  const handleOpenEdit = (id: number) => {
    setEdit(id);
    setModalOpen(true);
  };
  

  const handleOpenCaja = (Lote: string) => {
    setLoteSelected(Lote);
    setOpenCajas(true);
  };

  return (
    <div>
      {!openCajas && (
        <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
          {pendingQuoteId > 0 && <div className="mb-4 rounded-2xl border border-[#007782]/25 bg-[#007782]/5 p-4 text-sm text-slate-700"><strong className="text-[#007782]">Cotización #{pendingQuoteId} pendiente de cobro.</strong> Abre el turno de Caja donde registrarás la venta; se cargará automáticamente.</div>}
          <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div><p className="text-sm font-semibold text-[#c70063]">Punto de venta</p><h1 className="text-2xl font-bold text-slate-900">Turnos de caja</h1><p className="text-sm text-slate-500">Abre un turno, registra ventas y realiza el corte al finalizar.</p></div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_auto]">
              <input
                type="text"
                placeholder="Buscar turno o lote"
                aria-label="Buscar turnos de caja"
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 border border-gray-300 rounded-md w-full"
              />
              {(isAdmin || isTrabajador) && (
              <button
                onClick={handleOpen}
                className="rounded-xl bg-[#c70063] px-4 py-2.5 font-semibold text-white hover:bg-[#a90054]"
              >
                <span className="inline-flex items-center gap-2"><Plus size={18} />Abrir turno</span>
              </button>
              )}
            </div>
          </div>

          <CajasList openCaja={handleOpenCaja} openCut={handleOpenEdit} searchTerm={searchTerm} />

          {modalOpen && (
            <ModalCajas
                onClose={() => {
                  setModalOpen(false);
                  setEdit(undefined);
                }}
                onEdit={edit}
            />
          )}
        </section>
      )}
      {openCajas && (
        <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setOpenCajas(false)}
              className="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft size={18} /><span className="text-sm">Volver a turnos</span>
            </button>
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button onClick={() => setOpenCajasDetalles(false)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${!openCajasDetalles ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}><ShoppingCart size={16} />Venta</button><button onClick={() => setOpenCajasDetalles(true)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${openCajasDetalles ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}><BarChart3 size={16} />Resumen</button></div>
          </div>

          {!openCajasDetalles && <div className="border-t border-slate-100 pt-5"><Cajas Lote={loteSelected} /></div>}

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
        </section>
      )}
    </div>
  );
};

export default CajasPage;

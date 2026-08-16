
import { useState } from "react";
import FacturasList from "../../components/facturas/facturaslist/FacturasList";

const FacturasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  return (
    
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div><p className="text-sm font-semibold text-[#c70063]">Facturación</p><h1 className="text-2xl font-bold text-slate-900">Facturas</h1><p className="text-sm text-slate-500">Consulta comprobantes emitidos y su estado.</p></div>

            <div className="grid grid-cols-1 gap-2">
            <input
                type="text"
                placeholder="Buscar por folio, RFC o cliente"
                aria-label="Buscar facturas"
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />

            </div>
        </div>

        <FacturasList searchTerm={searchTerm}/>
    </section>
  );
};

export default FacturasPage;

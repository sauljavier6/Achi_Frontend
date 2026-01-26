
import { useState } from "react";
import styles from "./FacturasPage.module.scss";
import FacturasList from "../../components/facturas/facturaslist/FacturasList";

const FacturasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  return (
    
    <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h1 className={styles.title}>Facturas</h1>

            <div className="grid grid-cols-1 gap-2">
            <input
                type="text"
                placeholder="Buscar factura..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />

            </div>
        </div>

        <FacturasList searchTerm={searchTerm}/>
    </div>
  );
};

export default FacturasPage;

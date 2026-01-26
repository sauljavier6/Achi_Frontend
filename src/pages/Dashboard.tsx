import { FaCashRegister, FaShoppingCart, FaUsers, FaBoxOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  return (
    <div className="sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Dashboard POS</h1>

      {/* Tarjetas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center">
          <div className="bg-blue-500 text-white p-3 rounded-full">
            <FaCashRegister size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Ventas Hoy</p>
            
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center">
          <div className="bg-green-500 text-white p-3 rounded-full">
            <FaShoppingCart size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Pedidos</p>
            
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center">
          <div className="bg-yellow-500 text-white p-3 rounded-full">
            <FaUsers size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Clientes</p>
            
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center">
          <div className="bg-red-500 text-white p-3 rounded-full">
            <FaBoxOpen size={24} />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Inventario</p>
            
          </div>
        </div>
      </div>

      {/* Gráfica de ventas (placeholder) */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ventas Semanales</h2>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300">
          {/* Aquí puedes poner un chart, ejemplo: Chart.js o Recharts */}
          Gráfico de ventas
        </div>
      </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-blue-500 text-white p-4 rounded-lg text-center cursor-pointer hover:bg-blue-600 transition"
            onClick={() => navigate("/pos/productos")}
          >
            <p className="text-lg font-semibold">Productos</p>
          </div>

          <div
            className="bg-green-500 text-white p-4 rounded-lg text-center cursor-pointer hover:bg-green-600 transition"
            onClick={() => navigate("/pos/ventas")}
          >
            <p className="text-lg font-semibold">Ventas</p>
          </div>

          <div
            className="bg-yellow-500 text-white p-4 rounded-lg text-center cursor-pointer hover:bg-yellow-600 transition"
            onClick={() => navigate("/pos/clientes")}
          >
            <p className="text-lg font-semibold">Clientes</p>
          </div>

          <div
            className="bg-red-500 text-white p-4 rounded-lg text-center cursor-pointer hover:bg-red-600 transition"
            onClick={() => navigate("/pos/proveedores")}
          >
            <p className="text-lg font-semibold">Proveedores</p>
          </div>
        </div>
    </div>
  );
};

export default DashboardPage;

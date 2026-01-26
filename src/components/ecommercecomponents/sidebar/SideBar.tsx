// Sidebar.jsx
const Sidebar = () => {
  return (
    <div className="h-full w-full bg-white p-6 shadow-md rounded-t-lg">
    <h2 className="text-2xl font-bold mb-6 text-blue-700">Menú</h2>
      <nav className="flex flex-col gap-4">
        <a href="/productos" className="text-gray-700 hover:text-blue-600">Productos</a>
        <a href="/servicios" className="text-gray-700 hover:text-blue-600">Servicios</a>
        <a href="/nosotros" className="text-gray-700 hover:text-blue-600">Nosotros</a>
        <a href="/contacto" className="text-gray-700 hover:text-blue-600">Contacto</a>
      </nav>
    </div>
  );
};

export default Sidebar; 
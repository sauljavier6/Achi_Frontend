import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getAuthUser } from "../../../utils/auth";


const AdminLayout = () => {
type SubmenuKey = 'productos' | 'ventas' | 'cajas' | 'compras' | 'facturacion';
const { isAdmin, isTrabajador } = useAuth();
const [profileOpen, setProfileOpen] = useState(false);

const user = getAuthUser();

console.log("PROFILE URL:", import.meta.env.VITE_API_URL_PROFILE);
console.log(
  "FINAL IMG:",
  !user?.Imagen || user?.Imagen === "default.png"
    ? "default"
    : `${import.meta.env.VITE_API_URL_PROFILE}${user?.Imagen}`
);


const profileImage =
  !user?.Imagen || user?.Imagen === "default.png"
    ? "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
    : `${import.meta.env.VITE_API_URL_PROFILE}${user?.Imagen}`;

const [openSubmenus, setOpenSubmenus] = useState<Record<SubmenuKey, boolean>>({
  productos: false,
  ventas: false,
  cajas: false, 
  compras: false,
  facturacion: false,
});

const toggleSubmenu = (menu: SubmenuKey) => {
  setOpenSubmenus((prev) => ({
    ...prev,
    [menu]: !prev[menu],
  }));
};

const navigate = useNavigate();

const handleSignOut = () => {
  localStorage.removeItem("token");
  navigate("/login");
};

useEffect(() => {
  const close = () => setProfileOpen(false);
  window.addEventListener("click", close);
  return () => window.removeEventListener("click", close);
}, []);


  return (
    <div>     
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end gap-2">
              <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                  <span className="sr-only">Open sidebar</span>
                  <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                  </svg>
              </button>
                <img src="/medicare.png" className="h-8 me-3 rounded" alt="FlowBite Logo" />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">MEDICARE TJ</span>
            </div>
            <div className="flex items-center">
                <div className="relative flex items-center ms-3">
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileOpen(prev => !prev);
                      }}
                      className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                    >
                      <span className="sr-only">Open user menu</span>
                      
                      <img className="w-8 h-8 rounded-full"  src={profileImage} alt="user photo"/>
                    </button>
                  </div>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600">
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {user?.Name || "Nombre de usuario"}
                        </p>
                      </div>

                      <ul className="py-1">
                        <li>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                            Settings
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            Sign out
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>
      </nav>
      {(isAdmin || isTrabajador) && (
      <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
            <ul className="space-y-2 font-medium">
              <li>
                  <a href="/pos/dashboard" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <img src="/icons/inicio.png" alt="productos" className="w-5 h-5 object-contain" />
                    <span className="ms-3">Inicio</span>
                  </a>
              </li>
              
              <li>
                <button
                  type="button"
                  onClick={() => toggleSubmenu("productos")}
                  className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="flex items-center">
                    <img
                      src="/icons/productos.png"
                      alt="productos"
                      className="w-5 h-5 object-contain"
                    />
                    <span className="ms-3">Productos</span>
                  </div>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${openSubmenus.productos ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 011.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {openSubmenus.productos && (
                  <ul className="mt-1 space-y-1 pl-[2.25rem]">
                    <li>
                      <a
                        href="/pos/productos"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Productos
                      </a>
                    </li>
                    {/*<li>
                      <a
                        href="/pos/categorias"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Categorías
                      </a>
                    </li>*/}
                  </ul>
                )}
              </li>
            
              <li>
                <button
                  type="button"
                  onClick={() => toggleSubmenu("ventas")}
                  className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="flex items-center">
                    <img
                      src="/icons/ventas.png"
                      alt="ventas"
                      className="w-5 h-5 object-contain"
                    />
                    <span className="ms-3">Ventas</span>
                  </div>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      openSubmenus.ventas ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 011.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {openSubmenus.ventas && (
                  <ul className="mt-1 space-y-1 pl-[2.25rem]">
                    <li>
                      <a
                        href="/pos/ventas"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Ventas
                      </a>
                    </li>
                    <li>
                      <a
                        href="/pos/cotizaciones"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Cotizaciones
                      </a>
                    </li>
                    <li>
                      <a
                        href="/pos/clientes"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Clientes
                      </a>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => toggleSubmenu("cajas")}
                  className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="flex items-center">
                    <img
                      src="/icons/cajas.png"
                      alt="cajas"
                      className="w-5 h-5 object-contain"
                    />
                    <span className="ms-3">Cajas</span>
                  </div>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      openSubmenus.cajas ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 011.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {openSubmenus.cajas && (
                  <ul className="mt-1 space-y-1 pl-[2.25rem]">
                    <li>
                      <a
                        href="/pos/cajas"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Cajas
                      </a>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => toggleSubmenu("compras")}
                  className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="flex items-center">
                    <img
                      src="/icons/compras.png"
                      alt="compras"
                      className="w-5 h-5 object-contain"
                    />
                    <span className="ms-3">Compras y Gastos</span>
                  </div>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      openSubmenus.compras ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 011.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {openSubmenus.compras && (
                  <ul className="mt-1 space-y-1 pl-[2.25rem]">
                    <li>
                      <a
                        href="/pos/compras"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Compras y Gastos
                      </a>
                    </li>
                    <li>
                      <a
                        href="/pos/proveedores"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Proveedores
                      </a>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => toggleSubmenu("facturacion")}
                  className="flex items-center justify-between w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="flex items-center">
                    <img
                      src="/icons/factura.png"
                      alt="compras"
                      className="w-5 h-5 object-contain"
                    />
                    <span className="ms-3">Facturacion</span>
                  </div>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      openSubmenus.facturacion ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 011.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {openSubmenus.facturacion && (
                  <ul className="mt-1 space-y-1 pl-[2.25rem]">
                    <li>
                      <a
                        href="/pos/facturas"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Facturas
                      </a>
                    </li>
                    <li>
                      <a
                        href="/pos/facturacion"
                        className="block p-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg"
                      >
                        Modulo de Facturacion
                      </a>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                  <a href="/pos/pedidos" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <img src="/icons/reportes.png" alt="productos" className="w-5 h-5 object-contain" />
                    <span className="flex-1 ms-3 whitespace-nowrap">Pedidos</span>
                  </a>
              </li>
              {isAdmin && (
              <li>
                  <a href="/pos/reportes" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <img src="/icons/reportes.png" alt="productos" className="w-5 h-5 object-contain" />
                    <span className="flex-1 ms-3 whitespace-nowrap">Reportes</span>
                  </a>
              </li>
              )}
            </ul>
        </div>
      </aside>
      )}
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 sm:ml-64 sm:p-6">
        <div className="mt-16">
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow-md sm:p-6 border border-gray-200 dark:border-gray-700">
            <Outlet />
          </div>
        </div>
      </div> 
    </div>
  );
};

export default AdminLayout;

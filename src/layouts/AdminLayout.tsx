import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAuthUser } from "../utils/auth";
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";

const AdminLayout = () => {
  type SubmenuKey =
    | "inicio"
    | "productos"
    | "ventas"
    | "cajas"
    | "compras"
    | "facturacion";
  const { isAdmin, isTrabajador } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const user = getAuthUser();

  console.log("PROFILE URL:", import.meta.env.VITE_API_URL_PROFILE);
  console.log(
    "FINAL IMG:",
    !user?.Imagen || user?.Imagen === "default.png"
      ? "default"
      : `${import.meta.env.VITE_API_URL_PROFILE}${user?.Imagen}`,
  );

  const profileImage =
    !user?.Imagen || user?.Imagen === "default.png"
      ? "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
      : `${import.meta.env.VITE_API_URL_PROFILE}${user?.Imagen}`;

  const [openSubmenus, setOpenSubmenus] = useState<Record<SubmenuKey, boolean>>(
    {
      inicio: false,
      productos: false,
      ventas: false,
      cajas: false,
      compras: false,
      facturacion: false,
    },
  );

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
    <div className="bg-gray-100 font-sans antialiased text-main">
      <div className="flex h-screen overflow-hidden">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 sm:hidden"
          />
        )}

        {(isAdmin || isTrabajador) && (
          <aside
            className={`
            fixed top-0 left-0 z-40 w-64 h-screen
            bg-[#3f587a] flex flex-col shadow-xl
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            sm:translate-x-0
          `}
          >
            <div className="p-6 flex items-center">
              <img
                alt="FarmaGest Logo"
                className="h-10 w-auto object-contain"
                src="/logo.png"
              />
            </div>
            <nav className="flex-1 px-2 space-y-1 mt-4 overflow-y-auto">
              <NavLink
                to="/pos/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors group ${
                    isActive
                      ? "bg-sidebar-active text-white"
                      : "text-gray-300 hover:bg-sidebar-active"
                  }`
                }
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>

                <span className="font-medium">Inicio</span>
              </NavLink>
              <li>
                <button
                  onClick={() => toggleSubmenu("productos")}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                    openSubmenus.productos
                      ? "bg-sidebar-active text-white"
                      : "text-gray-300 hover:bg-sidebar-active"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>

                    <span className="font-medium">Productos</span>
                  </div>

                  <span
                    className={`text-xs transition-transform ${
                      openSubmenus.productos ? "rotate-90" : ""
                    }`}
                  ></span>
                </button>

                {openSubmenus.productos && (
                  <ul className="mt-1 ml-8 space-y-1">
                    <li>
                      <NavLink
                        to="/pos/productos"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Productos
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/pos/categorias"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Categorías
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/pos/subcategorias"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Subcategorías
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  onClick={() => toggleSubmenu("ventas")}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                    openSubmenus.ventas
                      ? "bg-sidebar-active text-white"
                      : "text-gray-300 hover:bg-sidebar-active"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>

                    <span className="font-medium">Ventas</span>
                  </div>

                  <span
                    className={`text-xs transition-transform ${
                      openSubmenus.ventas ? "rotate-90" : ""
                    }`}
                  ></span>
                </button>

                {openSubmenus.ventas && (
                  <ul className="mt-1 ml-8 space-y-1">
                    <li>
                      <NavLink
                        to="/pos/ventas"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Ventas
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/pos/cotizaciones"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Cotizaciones
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        to="/pos/clientes"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Clientes
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              <NavLink
                to="/pos/cajas"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-active text-white"
                      : "text-gray-300 hover:bg-sidebar-active"
                  }`
                }
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>

                <span className="font-medium">Cajas</span>
              </NavLink>

              <li>
                <button
                  onClick={() => toggleSubmenu("compras")}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                    isActive("/pos/compras") || isActive("/pos/proveedores")
                      ? "bg-sidebar-active text-white"
                      : "text-gray-300 hover:bg-sidebar-active"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>

                    <span className="font-medium">Compras y Gastos</span>
                  </div>

                  <span
                    className={`text-xs transition-transform ${
                      openSubmenus.compras ? "rotate-90" : ""
                    }`}
                  ></span>
                </button>

                {openSubmenus.compras && (
                  <ul className="mt-1 ml-8 space-y-1">
                    <li>
                      <NavLink
                        to="/pos/compras"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Compras y Gastos
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/pos/proveedores"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Proveedores
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  onClick={() => toggleSubmenu("facturacion")}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                    isActive("/pos/facturas") || isActive("/pos/facturacion")
                      ? "bg-sidebar-active text-white"
                      : "text-gray-300 hover:bg-sidebar-active"
                  }`}
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>

                    <span className="font-medium">Facturación</span>
                  </div>

                  <span
                    className={`text-xs transition-transform ${
                      openSubmenus.facturacion ? "rotate-90" : ""
                    }`}
                  ></span>
                </button>

                {openSubmenus.facturacion && (
                  <ul className="mt-1 ml-8 space-y-1">
                    <li>
                      <NavLink
                        to="/pos/facturas"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Facturas
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/pos/facturacion"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg ${
                            isActive
                              ? "bg-sidebar-active text-white"
                              : "text-gray-300 hover:bg-sidebar-active"
                          }`
                        }
                      >
                        Módulo de Facturación
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              <NavLink
                to="/pos/pedidos"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-active text-white"
                      : "text-gray-300 hover:bg-sidebar-active"
                  }`
                }
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <span className="font-medium">Pedidos</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/pos/reportes"
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-colors group ${
                      isActive
                        ? "bg-sidebar-active text-white"
                        : "text-gray-300 hover:bg-sidebar-active"
                    }`
                  }
                >
                  <img
                    src="/icons/reportes.png"
                    alt="reportes"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Reportes
                  </span>
                </NavLink>
              )}
            </nav>
          </aside>
        )}

        <main className="flex-1 flex flex-col min-w-0 bg-white sm:ml-64">
          <header className="bg-white px-4 sm:px-8 py-4 flex justify-between items-center border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-200"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* opcional: logo o título */}
              <span className="font-semibold text-gray-700 hidden sm:block">
                FarmaGest
              </span>
            </div>

            <div className="relative flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen((prev) => !prev);
                }}
                className="flex rounded-full border border-gray-300 hover:bg-gray-100 p-1 transition"
              >
                <img
                  className="w-9 h-9 rounded-full object-cover"
                  src={profileImage}
                  alt="user photo"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-white rounded-lg shadow-lg border">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.Name || "Usuario"}
                    </p>
                  </div>

                  <ul className="py-1">
                    <li>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                        Configuración
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 pb-8 bg-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

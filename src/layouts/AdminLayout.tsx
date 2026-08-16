import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes, ChevronDown, CircleDollarSign, FileText, LayoutDashboard,
  LogOut, Menu, PackageSearch, ReceiptText, ShoppingBag, Store,
  Truck, Users, WalletCards, X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getAuthUser } from "../utils/auth";

type NavItem = { label: string; to: string; icon: typeof Store };
type NavGroup = { label: string; icon: typeof Store; items: NavItem[] };

const groups: NavGroup[] = [
  { label: "Catálogo", icon: Boxes, items: [
    { label: "Productos", to: "/pos/productos", icon: PackageSearch },
    { label: "Categorías", to: "/pos/categorias", icon: Boxes },
    { label: "Subcategorías", to: "/pos/subcategorias", icon: Boxes },
  ] },
  { label: "Ventas", icon: CircleDollarSign, items: [
    { label: "Ventas", to: "/pos/ventas", icon: CircleDollarSign },
    { label: "Cotizaciones", to: "/pos/cotizaciones", icon: ReceiptText },
    { label: "Clientes", to: "/pos/clientes", icon: Users },
  ] },
  { label: "Compras", icon: ShoppingBag, items: [
    { label: "Compras y gastos", to: "/pos/compras", icon: ShoppingBag },
    { label: "Proveedores", to: "/pos/proveedores", icon: Truck },
  ] },
  { label: "Facturación", icon: FileText, items: [
    { label: "Facturas", to: "/pos/facturas", icon: FileText },
    { label: "Emitir factura", to: "/pos/facturacion", icon: ReceiptText },
  ] },
];

const directItems: NavItem[] = [
  { label: "Inicio", to: "/pos/dashboard", icon: LayoutDashboard },
  { label: "Caja", to: "/pos/cajas", icon: WalletCards },
  { label: "Pedidos web", to: "/pos/pedidos", icon: Store },
];

export default function AdminLayout() {
  const { isAdmin, isTrabajador } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getAuthUser();
  const activeGroup = useMemo(() => groups.find((group) => group.items.some((item) => location.pathname === item.to))?.label, [location.pathname]);
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup ?? null);

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
    setSidebarOpen(false);
  }, [activeGroup, location.pathname]);

  const signOut = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };
  const profileImage = user?.Imagen && user.Imagen !== "default.png"
    ? `${import.meta.env.VITE_API_URL_PROFILE}${user.Imagen}` : "/logo.png";
  const navClass = ({ isActive }: { isActive: boolean }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-white text-primary shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"}`;

  if (!isAdmin && !isTrabajador) return null;

  return <div className="min-h-screen bg-[#f2f3f6] text-on-surface">
    {sidebarOpen && <button aria-label="Cerrar navegación" className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary px-4 pb-4 pt-5 shadow-2xl transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-6 flex items-center gap-3 px-2">
        <img src="/logo.png" alt="Achi Veterinaria" className="h-11 w-11 rounded-2xl bg-white object-cover" />
        <div className="min-w-0 text-white"><p className="truncate text-lg font-extrabold">Achi Veterinaria</p><p className="text-xs text-white/65">Punto de venta</p></div>
        <button className="ml-auto rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={20} /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Navegación principal">
        {directItems.slice(0, 1).map(({ icon: Icon, ...item }) => <NavLink key={item.to} to={item.to} className={navClass}><Icon size={19} /><span>{item.label}</span></NavLink>)}
        {groups.slice(0, 2).map((group) => {
          const open = openGroup === group.label; const Icon = group.icon;
          return <div key={group.label}>
            <button aria-expanded={open} onClick={() => setOpenGroup(open ? null : group.label)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${activeGroup === group.label ? "text-white" : "text-white/80 hover:bg-white/10"}`}>
              <Icon size={19} /><span className="flex-1 text-left">{group.label}</span><ChevronDown size={17} className={`transition ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <div className="ml-5 space-y-1 border-l border-white/20 py-1 pl-3">{group.items.map(({ icon: ItemIcon, ...item }) => <NavLink key={item.to} to={item.to} className={navClass}><ItemIcon size={17} /><span>{item.label}</span></NavLink>)}</div>}
          </div>;
        })}
        {directItems.slice(1).map(({ icon: Icon, ...item }) => <NavLink key={item.to} to={item.to} className={navClass}><Icon size={19} /><span>{item.label}</span></NavLink>)}
        {groups.slice(2).map((group) => {
          const open = openGroup === group.label; const Icon = group.icon;
          return <div key={group.label}><button aria-expanded={open} onClick={() => setOpenGroup(open ? null : group.label)} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"><Icon size={19} /><span className="flex-1 text-left">{group.label}</span><ChevronDown size={17} className={`transition ${open ? "rotate-180" : ""}`} /></button>{open && <div className="ml-5 space-y-1 border-l border-white/20 py-1 pl-3">{group.items.map(({ icon: ItemIcon, ...item }) => <NavLink key={item.to} to={item.to} className={navClass}><ItemIcon size={17} /><span>{item.label}</span></NavLink>)}</div>}</div>;
        })}
      </nav>
      <button onClick={signOut} className="mt-3 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"><LogOut size={19} />Cerrar sesión</button>
    </aside>

    <div className="min-h-screen lg:pl-72">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-black/5 bg-white/90 px-4 backdrop-blur md:px-7">
        <button onClick={() => setSidebarOpen(true)} className="mr-3 rounded-xl p-2 text-on-surface hover:bg-surface-container-low lg:hidden" aria-label="Abrir menú"><Menu size={23} /></button>
        <div className="min-w-0"><p className="truncate text-sm font-bold">Panel administrativo</p><p className="hidden text-xs text-on-surface-variant sm:block">Gestiona la operación de Achi Veterinaria</p></div>
        <div className="relative ml-auto">
          <button onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-full border border-outline/25 bg-white p-1 pr-3 hover:bg-surface-container-low" aria-expanded={profileOpen}>
            <img className="h-9 w-9 rounded-full bg-slate-100 object-cover" src={profileImage} alt="Perfil" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/logo.png"; }} /><span className="hidden max-w-32 truncate text-sm font-semibold sm:block">{user?.Name || "Usuario"}</span><ChevronDown size={15} />
          </button>
          {profileOpen && <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/5 bg-white p-2 shadow-xl"><div className="border-b border-black/5 px-3 py-2"><p className="truncate text-sm font-bold">{user?.Name || "Usuario"}</p><p className="text-xs text-on-surface-variant">{isAdmin ? "Administrador" : "Trabajador"}</p></div><button onClick={signOut} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-error hover:bg-red-50"><LogOut size={17} />Cerrar sesión</button></div>}
        </div>
      </header>
      <main className="admin-content min-w-0 p-3 sm:p-5 lg:p-7"><Outlet /></main>
    </div>
  </div>;
}

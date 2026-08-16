import { ArrowRight, Boxes, CircleDollarSign, ClipboardList, PackagePlus, ShoppingBag, Store, Users, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthUser } from "../utils/auth";

const actions = [
  { label: "Nueva venta", description: "Registra productos y cobra una venta", to: "/pos/cajas", icon: CircleDollarSign, featured: true },
  { label: "Productos", description: "Consulta existencias y presentaciones", to: "/pos/productos", icon: Boxes },
  { label: "Pedidos web", description: "Revisa compras recibidas en línea", to: "/pos/pedidos", icon: Store },
  { label: "Cotizaciones", description: "Prepara y consulta cotizaciones", to: "/pos/cotizaciones", icon: ClipboardList },
  { label: "Clientes", description: "Consulta el directorio de clientes", to: "/pos/clientes", icon: Users },
  { label: "Compras y gastos", description: "Registra entradas y movimientos", to: "/pos/compras", icon: ShoppingBag },
];

export default function DashboardPage() {
  const user = getAuthUser();
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-lg sm:p-8">
      <div className="relative z-10 max-w-2xl"><p className="text-sm font-bold uppercase tracking-widest text-primary-fixed">Panel administrativo</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Hola, {user?.Name?.split(" ")[0] || "equipo"}</h1><p className="mt-3 max-w-xl text-white/75">¿Qué necesitas hacer hoy? Usa los accesos rápidos para llegar directamente a las tareas más frecuentes.</p></div>
    </section>

    <section><div className="mb-4"><h2 className="text-2xl font-extrabold">Acciones rápidas</h2><p className="mt-1 text-sm text-on-surface-variant">Las funciones principales de tu operación.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{actions.map(({ icon: Icon, featured, ...action }) => <Link key={action.to + action.label} to={action.to} className={`group flex min-h-36 flex-col rounded-3xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${featured ? "border-primary bg-primary text-white" : "border-black/5 bg-white hover:border-primary/25"}`}><span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${featured ? "bg-white/15" : "bg-primary-fixed text-primary"}`}><Icon size={22} /></span><div className="mt-auto flex items-end gap-3"><div className="flex-1"><h3 className="font-extrabold">{action.label}</h3><p className={`mt-1 text-sm ${featured ? "text-white/70" : "text-on-surface-variant"}`}>{action.description}</p></div><ArrowRight className="transition group-hover:translate-x-1" size={20} /></div></Link>)}</div></section>

    <section className="grid gap-4 md:grid-cols-3">
      <Link to="/pos/cajas" className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"><WalletCards className="text-secondary" /><div><strong className="block">Caja</strong><span className="text-sm text-on-surface-variant">Abrir, operar o consultar cortes</span></div></Link>
      <Link to="/pos/productos" className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"><PackagePlus className="text-secondary" /><div><strong className="block">Inventario</strong><span className="text-sm text-on-surface-variant">Mantener existencias actualizadas</span></div></Link>
      <Link to="/pos/ventas" className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"><CircleDollarSign className="text-secondary" /><div><strong className="block">Historial de ventas</strong><span className="text-sm text-on-surface-variant">Consultar pagos y movimientos</span></div></Link>
    </section>
  </div>;
}

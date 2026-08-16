import { Outlet } from "react-router-dom";
import { HeartPulse, ShieldCheck, Store } from "lucide-react";

export default function AuthLayout() {
  return <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/10" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-secondary/35" />
      <div className="relative flex items-center gap-3"><img src="/logo.png" alt="Achi Veterinaria" className="h-14 w-14 rounded-2xl bg-white object-cover" /><div><p className="text-2xl font-extrabold">Achi Veterinaria</p><p className="text-sm text-white/70">Administración y punto de venta</p></div></div>
      <div className="relative max-w-xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-primary-fixed">Todo en un solo lugar</p><h1 className="mt-4 text-5xl font-extrabold leading-tight">Una operación más clara, rápida y segura.</h1><p className="mt-5 text-lg leading-8 text-white/75">Controla ventas, inventario, clientes, compras y pedidos web desde una experiencia diseñada para tu equipo.</p></div>
      <div className="relative grid grid-cols-3 gap-3 text-sm"><div className="rounded-2xl bg-white/10 p-4"><Store className="mb-3" />Ventas</div><div className="rounded-2xl bg-white/10 p-4"><HeartPulse className="mb-3" />Atención</div><div className="rounded-2xl bg-white/10 p-4"><ShieldCheck className="mb-3" />Seguridad</div></div>
    </section>
    <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-md"><div className="mb-8 flex items-center justify-center gap-3 lg:hidden"><img src="/logo.png" alt="Achi Veterinaria" className="h-12 w-12 rounded-2xl object-cover" /><div><p className="font-extrabold text-primary">Achi Veterinaria</p><p className="text-xs text-on-surface-variant">Punto de venta</p></div></div><Outlet /></div>
    </section>
  </main>;
}

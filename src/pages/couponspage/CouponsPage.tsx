import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { listCoupons, saveCoupon, toggleCoupon } from "../../api/couponsApi";

const blank = { Code: "", Description: "", Type: "PERCENT", Value: "", MinimumPurchase: "", MaximumDiscount: "", UsageLimit: "", PerCustomerLimit: "", StartsAt: "", EndsAt: "", State: true };

function formatMxDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", { timeZone: "America/Tijuana", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(date).replace(",", "");
}

function parseMxDateTime(value: string) {
  if (!value.trim()) return null;
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Usa el formato dd/mm/aaaa hh:mm en las fechas");
  const [, day, month, year, hour, minute] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) throw new Error("La fecha capturada no es válida");
  return date.toISOString();
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["coupons"], queryFn: listCoupons });
  const [form, setForm] = useState<any>(blank);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await saveCoupon({ ...form, StartsAt: parseMxDateTime(form.StartsAt), EndsAt: parseMxDateTime(form.EndsAt) });
      toast.success("Cupón guardado correctamente"); setForm(blank);
      await queryClient.invalidateQueries({ queryKey: ["coupons"] });
    } catch (submitError) { toast.error(submitError instanceof Error ? submitError.message : "No se pudo guardar el cupón"); }
  };
  const editCoupon = (coupon: any) => setForm({ ...coupon, StartsAt: formatMxDateTime(coupon.StartsAt), EndsAt: formatMxDateTime(coupon.EndsAt) });
  const money = (value: unknown) => Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  return <section className="space-y-5">
    <header><p className="font-semibold text-[#c70063]">Ventas</p><h1 className="text-2xl font-extrabold">Cupones y descuentos</h1><p className="text-sm text-slate-500">Crea promociones controladas y auditables para caja y ecommerce.</p></header>
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">{form.ID_Coupon ? "Editar cupón" : "Nuevo cupón"}</h2>
        {[["Code","Código"],["Description","Descripción"]].map(([key,label]) => <label key={key} className="text-sm font-semibold sm:col-span-2">{label}<input required value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>)}
        <label className="text-sm font-semibold">Tipo<select value={form.Type} onChange={(event) => setForm({ ...form, Type: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="PERCENT">Porcentaje</option><option value="FIXED">Monto fijo</option></select></label>
        <label className="text-sm font-semibold">Valor<input required type="number" min=".01" step=".01" value={form.Value} onChange={(event) => setForm({ ...form, Value: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
        {[["MinimumPurchase","Compra mínima"],["MaximumDiscount","Descuento máximo"],["UsageLimit","Usos totales"],["PerCustomerLimit","Usos por cliente"]].map(([key,label]) => <label key={key} className="text-sm font-semibold">{label}<input type="number" min="0" step={key.includes("Purchase") || key.includes("Discount") ? ".01" : "1"} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>)}
        <label className="text-sm font-semibold">Inicia<span className="block text-xs font-normal text-slate-500">dd/mm/aaaa hh:mm</span><input type="text" inputMode="numeric" placeholder="28/08/2026 09:00" pattern="\d{2}/\d{2}/\d{4}\s\d{2}:\d{2}" value={form.StartsAt} onChange={(event) => setForm({ ...form, StartsAt: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
        <label className="text-sm font-semibold">Termina<span className="block text-xs font-normal text-slate-500">dd/mm/aaaa hh:mm</span><input type="text" inputMode="numeric" placeholder="31/08/2026 23:59" pattern="\d{2}/\d{2}/\d{4}\s\d{2}:\d{2}" value={form.EndsAt} onChange={(event) => setForm({ ...form, EndsAt: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
        <button className="rounded-xl bg-[#c70063] px-4 py-3 font-bold text-white active:translate-y-px sm:col-span-2">Guardar cupón</button>
      </form>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold">Cupones registrados</h2>
        {isLoading && <p className="text-sm text-slate-500">Cargando cupones…</p>}
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error instanceof Error ? error.message : "No se pudieron consultar los cupones"}</p>}
        {!isLoading && !error && !data?.data?.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Todavía no hay cupones registrados.</p>}
        <div className="grid gap-3">{data?.data?.map((coupon:any) => <div key={coupon.ID_Coupon} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2"><strong className="text-lg">{coupon.Code}</strong><span className={`rounded-full px-2 py-1 text-xs font-bold ${coupon.State ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{coupon.State ? "Activo" : "Inactivo"}</span></div><p className="text-sm text-slate-500">{coupon.Description}</p><p className="mt-1 text-sm font-semibold">{coupon.Type === "PERCENT" ? `${Number(coupon.Value)}%` : money(coupon.Value)} · Compra mínima {money(coupon.MinimumPurchase)}</p><p className="mt-1 text-xs text-slate-500">{coupon.StartsAt ? `Del ${formatMxDateTime(coupon.StartsAt)}` : "Disponible inmediatamente"}{coupon.EndsAt ? ` al ${formatMxDateTime(coupon.EndsAt)}` : " · Sin vencimiento"}</p></div><div className="flex gap-2"><button type="button" onClick={() => editCoupon(coupon)} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold active:translate-y-px">Editar</button><button type="button" onClick={async () => { await toggleCoupon(coupon.ID_Coupon); await queryClient.invalidateQueries({queryKey:["coupons"]}); }} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold active:translate-y-px">{coupon.State ? "Desactivar" : "Activar"}</button></div></div>)}</div>
      </article>
    </div>
  </section>;
}

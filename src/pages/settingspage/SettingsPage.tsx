import { useEffect, useState } from "react";
import { getShippingSettings, updateShippingSettings, type ShippingSettings } from "../../api/SettingsApi";

const initial: ShippingSettings = { enabled: true, amount: 250, taxRate: 0.16, productCode: "78101800", description: "Servicio de envío" };
export default function SettingsPage() {
  const [form, setForm] = useState(initial); const [busy, setBusy] = useState(true); const [message, setMessage] = useState("");
  useEffect(() => { getShippingSettings().then(setForm).catch(e => setMessage(e.message)).finally(() => setBusy(false)); }, []);
  const save = async () => { setBusy(true); setMessage(""); try { setForm(await updateShippingSettings(form)); setMessage("Configuración de envío guardada"); } catch (e) { setMessage(e instanceof Error ? e.message : "Error al guardar"); } finally { setBusy(false); } };
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <p className="text-sm font-bold text-[#c70063]">Configuración</p><h1 className="text-2xl font-bold">Envíos del ecommerce</h1>
    <p className="mt-1 text-sm text-slate-500">Se registra como una línea de servicio independiente: no genera inventario ni lotes y conserva su propio tratamiento fiscal.</p>
    {message && <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">{message}</div>}
    <div className="mt-6 max-w-4xl rounded-2xl bg-slate-50 p-4 sm:p-5">
      <label className="flex items-center gap-3 font-semibold"><input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} className="h-5 w-5 accent-[#c70063]"/>Cobrar envío en ecommerce</label>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Precio al cliente (IVA incluido)<input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal"/></label>
        <label className="text-sm font-semibold">IVA del servicio<select value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal"><option value={0.16}>16%</option><option value={0.08}>8% — sólo con estímulo fronterizo autorizado</option><option value={0}>No objeto / sin IVA</option></select></label>
        <label className="text-sm font-semibold">Clave SAT<input value={form.productCode} maxLength={8} onChange={e => setForm({ ...form, productCode: e.target.value.replace(/\D/g, "") })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal"/></label>
        <label className="text-sm font-semibold">Descripción en CFDI<input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal"/></label>
      </div>
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Con {Number(form.taxRate) * 100}% y un precio de ${Number(form.amount).toFixed(2)}, la base es ${(Number(form.amount) / (1 + Number(form.taxRate))).toFixed(2)} y el IVA incluido es ${(Number(form.amount) - Number(form.amount) / (1 + Number(form.taxRate))).toFixed(2)}.</div>
    </div>
    <button disabled={busy} onClick={save} className="mt-5 rounded-lg bg-[#c70063] px-6 py-3 font-bold text-white transition active:translate-y-0.5 disabled:opacity-50">{busy ? "Guardando…" : "Guardar configuración"}</button>
  </section>;
}

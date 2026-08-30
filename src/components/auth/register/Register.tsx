import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Camera, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { registerUser } from "../../../api/authApi/authApi";
import { verifyAuthCode } from "../../../api/authApi/authApi";
import OtpPanel from "../OtpPanel";
import type { Challenge } from "../OtpPanel";

interface RegisterProps { onBack?: (back: boolean) => void }

export default function Register({ onBack }: RegisterProps) {
  const [formData, setFormData] = useState({ name: "", email: "", imagen: null as File | null, password: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preview = formData.imagen ? URL.createObjectURL(formData.imagen) : null;
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const { mutate, isPending } = useMutation({ mutationFn: registerUser, onError: (error) => toast.error(error.message), onSuccess: (data) => { setChallenge(data); toast.info(data.message); } });

  if (challenge) return <OtpPanel challenge={challenge} title="Confirma tu correo" text="Escribe el código que enviamos a" busy={verifying} onBack={() => setChallenge(null)} onSubmit={async(code) => { setVerifying(true); try { const data = await verifyAuthCode({ challengeId: challenge.challengeId, code, purpose: "REGISTER" }); toast.success(data.message); onBack?.(false); } catch(error) { toast.error(error instanceof Error ? error.message : "Código inválido"); } finally { setVerifying(false); } }}/>;

  return <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl shadow-primary/5 sm:p-8">
    <button onClick={() => onBack?.(false)} className="mb-5 flex items-center gap-2 text-sm font-bold text-primary hover:underline"><ArrowLeft size={17} />Volver al acceso</button>
    <p className="text-sm font-bold uppercase tracking-widest text-secondary">Nueva cuenta</p><h1 className="mt-2 text-3xl font-extrabold">Crear cuenta</h1><p className="mt-2 text-sm leading-6 text-on-surface-variant">Completa los datos del integrante del equipo. La fotografía es opcional.</p>
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); if (formData.password.length < 10) return toast.error("La contraseña debe tener al menos 10 caracteres"); mutate({ ...formData, email: formData.email.trim(), name: formData.name.trim(), phone: formData.phone.trim() }); }}>
      <label className="sm:col-span-2"><span className="auth-label">Nombre completo</span><input className="auth-input" required autoComplete="name" placeholder="Nombre y apellidos" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></label>
      <label><span className="auth-label">Correo electrónico</span><input className="auth-input" required type="email" autoComplete="email" placeholder="nombre@correo.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></label>
      <label><span className="auth-label">Teléfono</span><input className="auth-input" required type="tel" inputMode="tel" autoComplete="tel" placeholder="10 dígitos" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+() -]/g, "") })} /></label>
      <label className="sm:col-span-2"><span className="auth-label">Contraseña</span><div className="relative"><input className="auth-input pr-12" required minLength={10} autoComplete="new-password" type={showPassword ? "text" : "password"} placeholder="Mínimo 10 caracteres" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-outline" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div><span className="mt-1 block text-xs text-on-surface-variant">Usa al menos 10 caracteres y evita datos fáciles de adivinar.</span></label>
      <div className="sm:col-span-2"><span className="auth-label">Fotografía de perfil <span className="font-normal text-on-surface-variant">(opcional)</span></span><button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-outline/50 p-3 text-left hover:border-primary hover:bg-primary-fixed/30">{preview ? <img src={preview} className="h-14 w-14 rounded-xl object-cover" alt="Vista previa" /> : <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container-low text-primary"><Camera /></span>}<span><strong className="block text-sm">{preview ? "Cambiar fotografía" : "Agregar fotografía"}</strong><span className="text-xs text-on-surface-variant">JPG, PNG o WEBP</span></span></button><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setFormData({ ...formData, imagen: e.target.files?.[0] || null })} /></div>
      <button disabled={isPending} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white hover:bg-primary-container disabled:opacity-60 sm:col-span-2">{isPending && <LoaderCircle className="animate-spin" size={20} />}{isPending ? "Creando cuenta…" : "Crear cuenta"}</button>
    </form>
  </div>;
}

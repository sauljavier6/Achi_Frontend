import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { loginUser } from "../../../api/authApi/authApi";

interface LoginProps { onRegister?: (register: boolean) => void }
interface DecodedToken { Rol: string }

export default function Login({ onRegister }: LoginProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onError: (error) => toast.error(error.message),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      const user = jwtDecode<DecodedToken>(data.token);
      toast.success("Sesión iniciada correctamente");
      navigate(["Administrador", "Trabajador"].includes(user.Rol) ? "/pos/dashboard" : "/", { replace: true });
    },
  });

  return <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl shadow-primary/5 sm:p-8">
    <p className="text-sm font-bold uppercase tracking-widest text-secondary">Bienvenido</p>
    <h1 className="mt-2 text-3xl font-extrabold text-on-surface">Iniciar sesión</h1>
    <p className="mt-2 text-sm leading-6 text-on-surface-variant">Ingresa con tu cuenta para acceder al panel administrativo.</p>
    <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); mutate({ email: formData.email.trim(), password: formData.password }); }}>
      <label className="block"><span className="mb-2 block text-sm font-bold">Correo electrónico</span><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={19} /><input autoComplete="email" inputMode="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="nombre@correo.com" className="auth-input pl-12" /></div></label>
      <label className="block"><span className="mb-2 block text-sm font-bold">Contraseña</span><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={19} /><input autoComplete="current-password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Tu contraseña" className="auth-input px-12" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-outline hover:bg-surface-container-low" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
      <button disabled={isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white transition hover:bg-primary-container disabled:cursor-wait disabled:opacity-60">{isPending && <LoaderCircle className="animate-spin" size={20} />}{isPending ? "Ingresando…" : "Iniciar sesión"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-on-surface-variant">¿Necesitas una cuenta? <button onClick={() => onRegister?.(true)} className="font-bold text-primary hover:underline">Crear cuenta</button></p>
  </div>;
}

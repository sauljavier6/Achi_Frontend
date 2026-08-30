import { useState } from "react";
import type React from "react";
import { ArrowLeft, LoaderCircle, MailCheck } from "lucide-react";
import { toast } from "react-toastify";
import { resendAuthCode } from "../../api/authApi/authApi";

export type Challenge = { challengeId: string; purpose: "REGISTER" | "LOGIN" | "RESET"; emailMasked: string };
export default function OtpPanel({ challenge, title, text, busy, onBack, onSubmit, children }: { challenge: Challenge; title: string; text: string; busy?: boolean; onBack: () => void; onSubmit?: (code: string) => void; children?: (code: string, setCode: (value: string) => void) => React.ReactNode }) {
  const [code, setCode] = useState(""); const [resending, setResending] = useState(false);
  const resend = async () => { setResending(true); try { const next = await resendAuthCode(challenge.challengeId); Object.assign(challenge, next); toast.success("Código reenviado"); } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos reenviar"); } finally { setResending(false); } };
  return <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl shadow-primary/5 sm:p-8">
    <button type="button" onClick={onBack} className="mb-5 flex items-center gap-2 text-sm font-bold text-primary hover:underline"><ArrowLeft size={17}/>Volver</button>
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary"><MailCheck/></span><h1 className="mt-4 text-3xl font-extrabold">{title}</h1><p className="mt-2 text-sm leading-6 text-on-surface-variant">{text} <strong>{challenge.emailMasked}</strong></p>
    {children ? children(code, setCode) : <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); onSubmit?.(code); }}><label className="block"><span className="auth-label">Código de 6 dígitos</span><input autoFocus className="auth-input text-center text-2xl font-bold tracking-[.35em]" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}/></label><button disabled={busy || code.length !== 6} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white disabled:opacity-50">{busy && <LoaderCircle className="animate-spin" size={20}/>}Confirmar código</button></form>}
    <p className="mt-5 text-center text-sm text-on-surface-variant">¿No llegó? <button type="button" disabled={resending} onClick={resend} className="font-bold text-primary hover:underline disabled:opacity-50">{resending ? "Enviando…" : "Reenviar código"}</button></p>
  </div>;
}

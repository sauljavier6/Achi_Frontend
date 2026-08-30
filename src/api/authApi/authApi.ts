interface User { name: string; email: string; password: string; imagen: File | null }
type LoginCredentials = Pick<User, "email" | "password"> & { trustedDeviceToken?: string | null };

async function apiError(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({}));
  return new Error(body.message || fallback);
}

export const loginUser = async (data: LoginCredentials) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
  if (!response.ok) throw await apiError(response, "No pudimos iniciar sesión. Revisa tu correo y contraseña.");
  return response.json();
};

export const registerUser = async (formData: { name: string; email: string; phone: string; password: string; imagen: File | null }) => {
  const data = new FormData();
  data.append("name", formData.name); data.append("email", formData.email); data.append("phone", formData.phone); data.append("password", formData.password);
  if (formData.imagen) data.append("profileImage", formData.imagen);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, { method: "POST", body: data });
  if (!response.ok) throw await apiError(response, "No pudimos crear la cuenta.");
  return response.json();
};

async function postJson(path: string, data: unknown, fallback: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw await apiError(response, fallback);
  return response.json();
}
export const verifyAuthCode = (data: { challengeId: string; code: string; purpose: "REGISTER" | "LOGIN"; rememberDevice?: boolean }) => postJson("/auth/verify", data, "No pudimos validar el código.");
export const resendAuthCode = (challengeId: string) => postJson("/auth/resend", { challengeId }, "No pudimos reenviar el código.");
export const forgotPassword = (email: string) => postJson("/auth/password/forgot", { email }, "No pudimos iniciar la recuperación.");
export const resetPassword = (data: { challengeId: string; code: string; password: string }) => postJson("/auth/password/reset", data, "No pudimos cambiar la contraseña.");
export const logoutUser = (trustedDeviceToken?: string | null) => postJson("/auth/logout", { trustedDeviceToken }, "No pudimos revocar el dispositivo.");

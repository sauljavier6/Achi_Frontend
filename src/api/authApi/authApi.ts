interface User { name: string; email: string; password: string; imagen: File | null }
type LoginCredentials = Pick<User, "email" | "password">;

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

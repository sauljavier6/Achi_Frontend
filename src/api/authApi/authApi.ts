interface User {  
    name: string;
    email: string;
    password: string;
    imagen: File | null;
}

type LoginCredentials = Pick<User, 'email' | 'password'>;

export const loginUser = async (data:LoginCredentials) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al iniciar sesión');
  return await res.json();
};

export const registerUser = async (formData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  imagen: File | null;
}) => {
  const data = new FormData();

  data.append("name", formData.name);
  data.append("email", formData.email);
  data.append("phone", formData.phone);
  data.append("password", formData.password);

  if (formData.imagen) {
    data.append("profileImage", formData.imagen);
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) throw new Error("Error al registrar usuario");
  return res.json();
};


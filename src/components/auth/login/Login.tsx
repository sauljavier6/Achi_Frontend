import { useEffect, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../../api/authApi/authApi';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onRegister?: (register: boolean) => void;
}

interface DecodedToken {
  ID_User: number;
  Name: string;
  ID_Rol: number;
  Rol: string;
  Imagen: string;
  exp: number;
  iat: number;
}


export default function Login({ onRegister }: LoginProps) {
    const [formData, setFormData] = useState({
    email: '',
    password: '',
    });
  const [userData, setUserData] = useState<DecodedToken | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData?.Rol) return;

    if (["Administrador", "Trabajador"].includes(userData.Rol)) {
      navigate("/pos/dashboard");
    } else {
      navigate("/");
    }
  }, [userData, navigate]);

    const { mutate } = useMutation({
    mutationFn: loginUser,
    onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);

      const decoded = jwtDecode<DecodedToken>(data.token);
      setUserData(decoded);

      toast.success("Usuario logeado con éxito", {
        position: "top-right",
      });
    },
    });


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <div className="min-h-120 flex flex-col items-center justify-center bg-white">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.2)] w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">Correo electrónico</label>
          <input
            type="email"
            id='email'
            name='email'
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            id='password'
            name='password'
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Iniciar Sesión
        </button>
      </form>

      {/* Enlace a registro */}
      <p className="mt-4 text-sm text-gray-600">
        ¿No tienes cuenta?{" "}
        <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => onRegister?.(true)}>
          Registrarse
        </span>
      </p>
    </div>
  );
}

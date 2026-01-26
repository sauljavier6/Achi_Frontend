import { useRef, useState } from 'react';
import { registerUser } from '../../../api/authApi/authApi';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

interface LoginProps {
  onBack?: (onBack: boolean) => void;
}

export default function Register({ onBack }: LoginProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    imagen: null as File | null,
    password: '',
    phone: ''
  });


    const { mutate } = useMutation({
    mutationFn: registerUser,
    onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
    },
    onSuccess: () => {
        resetForm();
        toast.success("Usuario registrado con éxito", {
        position: "top-right",
        progressClassName: "custom-progress",
        });
    },
    });

    const resetForm = () => {
    setFormData({
        name: '',
        email: '',
        imagen: null,
        password: '',
        phone: ''
    });

    if (fileInputRef.current) {
    fileInputRef.current.value = '';
    }
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(formData);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="min-h-190 flex flex-col items-center justify-center bg-white">
        <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.2)] w-full max-w-sm"
        >
            <h2 className="text-2xl font-bold mb-4 text-center">Registrate</h2>

            <div className="mb-4">
            <label className="block text-sm font-medium">Nombre</label>
            <input
                type="text"
                id='name'
                name='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                required
            />
            </div>

            <div className="mb-4">
            <label className="block text-sm font-medium">Correo electrónico</label>
            <input
                type="email"
                id='email'
                name='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                required
            />
            </div>

            <div className="mb-6">
            <label className="block text-sm font-medium">Telefono</label>
            <input
                type="tel"
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                required
            />
            </div>

            {formData.imagen && (
            <img
                src={URL.createObjectURL(formData.imagen)}
                alt="Vista previa"
                className="mt-4 w-80 h-80 rounded object-cover"
            />
            )}

            <div className="mb-6">
            <label className="block text-sm font-medium">FOTO</label>
            <input
            type="file"
            id="imagen"
            name="imagen"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) =>
                setFormData({ ...formData, imagen: e.target.files?.[0] || null })
            }
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            required
            />
            </div>

            <div className="mb-6">
            <label className="block text-sm font-medium">Contraseña</label>
            <input
                type="password"
                id='password'
                name='password'
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                required
            />
            </div>

            <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
            Guardar
            </button>
        </form>

        {/* Enlace a login */}
        <p className="mt-4 text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => onBack?.(false)}>
            Iniciar Sesión
            </span>
        </p>
        </div>
    );
}

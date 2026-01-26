import { getAuthUser } from "../utils/auth";

export const useAuth = () => {
  const user = getAuthUser();

  return {
    user,
    role: user?.Rol,
    isAdmin: user?.Rol === "Administrador",
    isTrabajador: user?.Rol === "Trabajador",
    isLogged: !!user,
  };
};

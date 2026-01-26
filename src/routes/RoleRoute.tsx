import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RoleRouteProps {
  allow: ("Administrador" | "Trabajador")[];
}

const RoleRoute = ({ allow }: RoleRouteProps) => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allow.includes(role as "Administrador" | "Trabajador")) {
    return <Navigate to="/pos/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;

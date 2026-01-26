// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  ID_User: number;
  Name: string;
  ID_Rol: number;
}

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded: JwtPayload = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }

    return <Outlet />;
  } catch (error) {
    console.log('error:',error)
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;

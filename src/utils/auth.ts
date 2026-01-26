import { jwtDecode } from "jwt-decode";

export interface AuthUser {
  ID_User: number;
  Name: string;
  Rol?: string;
  Imagen?: string;
}

export const getAuthUser = (): AuthUser | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode<AuthUser>(token);
  } catch {
    return null;
  }
};

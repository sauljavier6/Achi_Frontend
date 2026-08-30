const api = import.meta.env.VITE_API_URL;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` });
async function request(path: string, init?: RequestInit) { const response = await fetch(`${api}/security${path}`, { ...init, headers: { ...headers(), ...(init?.headers || {}) } }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message || "No fue posible completar la operación"); return body; }
export const getSecurityUsers = () => request("/users");
export const getPermissionCatalog = () => request("/permissions");
export const getUserPermissions = (id: number) => request(`/users/${id}/permissions`);
export const saveUserPermissions = (id: number, permissions: { permission: string; granted: boolean }[]) => request(`/users/${id}/permissions`, { method: "PUT", body: JSON.stringify({ permissions, replace: true }) });
export const getAuditLog = (page = 1) => request(`/audit?page=${page}&limit=25`);

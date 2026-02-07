import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <header className="bg-blue-800 w-full h-16 flex items-center px-4">
        <img src="/logo.jpg" alt="Logo" className="h-8 w-auto" />
        <span className="ml-3 text-white font-semibold text-xl">
          valentto mx
        </span>
      </header>
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;

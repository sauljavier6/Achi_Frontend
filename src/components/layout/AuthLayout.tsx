import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <header className="bg-blue-800 w-full h-16 flex items-center px-4">
        <img src="/medicare.png" alt="Logo" className="h-8 w-auto" />
        <span className="ml-3 text-white font-semibold text-xl">MEDICARE TJ</span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

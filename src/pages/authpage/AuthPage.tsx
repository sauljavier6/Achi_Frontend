import { useState } from "react";
import Login from "../../components/auth/login/Login";
import Register from "../../components/auth/register/Register";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  return isRegistering
    ? <Register onBack={() => setIsRegistering(false)} />
    : <Login onRegister={() => setIsRegistering(true)} />;
}

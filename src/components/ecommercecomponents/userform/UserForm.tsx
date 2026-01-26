import { useState, useEffect } from "react";

export default function UserForm({ setUser }: { setUser: (user: { name: string; email: string }) => void }) {
  const [inputName, setInputName] = useState<string>("");
  const [inputEmail, setInputEmail] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedName && storedEmail) {
      setInputName(storedName);
      setInputEmail(storedEmail);
      setUser({ name: storedName, email: storedEmail });
    }
  }, [setUser]);

  if (!isClient) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setInputName(newName);
    setUser({ name: newName, email: inputEmail });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setInputEmail(newEmail);
    setUser({ name: inputName, email: newEmail });
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-lg">
      <form>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
        Nombre
        </label>
        <input
          id="name"
          type="text"
          value={inputName}
          onChange={handleNameChange}
          placeholder="Nombre"
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />

        <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mt-4 mb-2">
        Email
        </label>
        <input
          id="email"
          type="email"
          value={inputEmail}
          onChange={handleEmailChange}
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </form>
    </div>
  );
}

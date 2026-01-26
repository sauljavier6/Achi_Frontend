import { useState, useEffect } from "react";

export default function AddressForm({ onSubmit }: { onSubmit: (address: any) => void }) {
  const [disabledSubmit, setDisabledSubmit] = useState(false);
  const [address, setAddress] = useState({
    _id:"",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const fetchSavedAddresses = async () => {
      const id = localStorage.getItem("userId");
  
      // Validación robusta
      if (!id || id === "null" || id.trim() === "") {
        console.warn("No se encontró un ID válido en localStorage. No se realizará la petición.");
        return;
      }
  
      try {
        const response = await fetch(`/api/addresses/address/${id}`, { method: "GET" });
        const result = await response.json();
        if (result.success) {
          setSavedAddresses(result.data);
        } else {
          console.error("Error al obtener direcciones:", result.message);
        }
      } catch (error) {
        console.error("Error en la petición:", error);
      }
    };
  
    fetchSavedAddresses();
  }, []);

  if (!isClient) return null; // Evita el error de hidratación
  

  const handleChange = (e: any) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(address);
    setDisabledSubmit(true);
    alert("Direccion Guardad");
  };

  const handleSelectAddress = (e: any) => {
    const selectedId = e.target.value;
    const selectedAddress = savedAddresses.find((addr) => addr._id === selectedId);
  
    if (selectedAddress) {
      setAddress({ ...selectedAddress });
    } else {
      console.log("No se encontró la dirección con ese ID");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4 text-center">Direccion</h2>
      
      {/* Mostrar las direcciones guardadas */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{("useSavedAddressLabel")}</label>
        <select
          name="savedAddress"
          onChange={handleSelectAddress}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona Direccion</option>
          {savedAddresses.map((addressItem) => (
            <option key={addressItem._id} value={addressItem._id}>
            {addressItem.street}, {addressItem.city}, {addressItem.state}, {addressItem.zip}, {addressItem.country}
            </option>          
          ))}
        </select>
      </div>
      
      {/* Si no seleccionaron una dirección guardada, mostrar el formulario de dirección */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="street"
          placeholder="Calle y numero"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={address.street}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="Ciudad"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={address.city}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="state"
          placeholder="Estado"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={address.state}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="zip"
          placeholder="Codigo postal"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={address.zip}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="country"
          placeholder="País"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={address.country}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        disabled={disabledSubmit}
      >
        Continuar
      </button>
    </form>
  );
}

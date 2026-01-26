import { useEffect, useState } from "react";
import styles from "./ModalCustomers.module.scss";
import { getCustomerByID_User, getCustomerSale } from "../../../../api/Post/clientesApi/ClientesApi";

interface CustomerFormData {
  ID_User?: number | undefined;
  Name: string;
  Phone: string;
  Email: string;
  RazonSocial?: string;
  CodigoPostal?: string;
  Rfc?: string;
  RegimenFiscal?: string;
}

interface ModalCustomersProps {
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
  onEdit?: number;
}

const ModalCustomers = ({ onClose, onSave, onEdit }: ModalCustomersProps) => {
  const [activeTab, setActiveTab] = useState<"personal" | "facturacion">("personal");
  const [user, setUser] = useState<CustomerFormData>({
    ID_User: undefined,
    Name: "",
    Phone: "",
    Email: "",
    RazonSocial: "",
    CodigoPostal: "",
    Rfc: "",
    RegimenFiscal: ""
  });

  useEffect(() => {
    const fetchCustomer = async (id: number) => {
      try {
        const customerData = await getCustomerByID_User(id);
        console.log("customerData", customerData);
          setUser((prev) => ({
            ...prev,
            ID_User: customerData.data.ID_User,
            Name: customerData.data.Name || "",
            Phone: customerData.data.Phone?.Description || "",
            Email: customerData.data.Email?.Description || "",
            RazonSocial: customerData.data.Facturacion?.RazonSocial || "",
            CodigoPostal: customerData.data.Facturacion?.CodigoPostal || "",
            Rfc: customerData.data.Facturacion?.Rfc || "",
            RegimenFiscal: customerData.data.Facturacion?.RegimenFiscal || "",
          }));
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };

    if (onEdit !== undefined) {
      fetchCustomer(onEdit);
    }
  }, [onEdit]);


  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const email = user?.Email?.trim();

        if (!email) {
          resetUser(email);
          return;
        }

        const customerData = await getCustomerSale(email);
        const data = customerData?.data;

        if (data) {
          setUser(prev => ({
            ...prev,
            ID_User: data.ID_User,
            Name: data.Name || "",
            Phone: data.Phone?.Description || "",
            Email: data.Email?.Description || email,
            RazonSocial: data.Facturacion?.RazonSocial || "",
            CodigoPostal: data.Facturacion?.CodigoPostal || "",
            Rfc: data.Facturacion?.Rfc || "",
            RegimenFiscal: data.Facturacion?.RegimenFiscal || "",
          }));
        } else {
          resetUser(email);
        }

      } catch (error) {
        console.error("Error fetching customer data:", error);
        resetUser(user?.Email?.trim());
      }
    };

    const resetUser = (email = "") => {
      setUser(prev => ({
        ...prev,
        ID_User: undefined,
        Name: "",
        Phone: "",
        Email: email,
        RazonSocial: "",
        CodigoPostal: "",
        Rfc: "",
        RegimenFiscal: ""
      }));
    };

    fetchCustomer();
  }, [user?.Email]);

  const isPersonalDataComplete = user.Name.trim() !== "" && user.Phone.trim() !== "" && user.Email.trim() !== "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-[95%] sm:max-w-md lg:max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Crear Cliente</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <img src="/icons/close.png" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-0 mb-6 bg-gray-200 rounded-[50px] overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex-1 px-3 py-2 text-sm md:text-base ${
              activeTab === "personal" ? styles.tabActive : styles.tabinActive
            }`}
          >
            Datos personales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("facturacion")}
            className={`flex-1 px-3 py-2 text-sm md:text-base ${
              activeTab === "facturacion" ? styles.tabActive : styles.tabinActive
            }`}
          >
            Datos de facturación
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(user);
            onClose();
          }}
        >
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Correo */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Correo
                </label>
                <input
                  id="Email"
                  type="email"
                  value={user.Email}
                  onChange={(event) =>
                    setUser((prev) => ({ ...prev, Email: event.target.value }))
                  }
                  placeholder="Correo"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nombre del cliente
                </label>
                <input
                  id="Name"
                  type="text"
                  value={user.Name}
                  onChange={(event) =>
                    setUser((prev) => ({ ...prev, Name: event.target.value }))
                  }
                  placeholder="Nombre del cliente"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="Phone"
                  type="tel"
                  value={user.Phone}
                  onChange={(event) => {
                    const soloNumeros = event.target.value.replace(/\D/g, "");
                    if (soloNumeros.length <= 10) {
                      setUser((prev) => ({ ...prev, Phone: soloNumeros }));
                    }
                  }}
                  placeholder="Teléfono"
                  required
                  minLength={10}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  title="Debe contener exactamente 10 dígitos numéricos"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}

          {activeTab === "facturacion" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Razon social */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Razón social
                </label>
                <input
                  id="razonsocialCliente"
                  type="text"
                  value={user.RazonSocial}
                  onChange={(event) =>
                    setUser((prev) => ({ ...prev, RazonSocial: event.target.value }))
                  }
                  placeholder="Razón social"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* CP */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Código postal
                </label>
                <input
                  id="codigopostalCliente"
                  type="text"
                  value={user.CodigoPostal}
                  onChange={(event) =>
                    setUser((prev) => ({ ...prev, CodigoPostal: event.target.value }))
                  }
                  placeholder="Código postal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* RFC */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  RFC
                </label>
                <input
                  id="rfcCliente"
                  type="text"
                  value={user.Rfc}
                  onChange={(event) =>
                    setUser((prev) => ({ ...prev, Rfc: event.target.value }))
                  }
                  placeholder="RFC"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Régimen fiscal */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Régimen Fiscal
                </label>
                <select
                  value={user?.RegimenFiscal || ""}
                  onChange={(e) =>
                    setUser((prev) => ({ ...prev, RegimenFiscal: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-500 rounded-md
                            focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Selecciona régimen fiscal</option>
                  <option value="601">601 - General de Ley Personas Morales</option>
                  <option value="605">605 - Sueldos y Salarios</option>
                  <option value="606">606 - Arrendamiento</option>
                  <option value="608">608 - Demás ingresos</option>
                  <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                  <option value="616">616 - Sin obligaciones fiscales</option>
                  <option value="621">621 - Incorporación Fiscal</option>
                </select>
              </div>
            </div>
          )}

          {/* Botón */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className={`${styles.submitButton} ${
                !isPersonalDataComplete ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isPersonalDataComplete}
            >
              Guardar cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCustomers;

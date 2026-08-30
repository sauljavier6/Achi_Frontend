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
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
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


  const handleEmailBlur = async () => {
    const email = user.Email.trim().toLowerCase();
    if (onEdit !== undefined || !email || !/^\S+@\S+\.\S+$/.test(email)) return;

    setIsCheckingEmail(true);
    setEmailMessage("");
    try {
      const customerData = await getCustomerSale(email);
      const data = customerData?.data;
      if (!data) {
        setUser((prev) => ({ ...prev, Email: email, ID_User: undefined }));
        setEmailMessage("Correo disponible para un cliente nuevo.");
        return;
      }

      setUser((prev) => ({
        ...prev,
        ID_User: data.ID_User,
        Name: data.Name || prev.Name,
        Phone: data.Phone?.Description || prev.Phone,
        Email: data.Email?.Description || email,
        RazonSocial: data.Facturacion?.RazonSocial || "",
        CodigoPostal: data.Facturacion?.CodigoPostal || "",
        Rfc: data.Facturacion?.Rfc || "",
        RegimenFiscal: data.Facturacion?.RegimenFiscal || "",
      }));
      setEmailMessage("Cliente existente encontrado; cargamos sus datos.");
    } catch (error) {
      console.error("Error verificando el correo del cliente:", error);
      setEmailMessage("No pudimos verificar el correo. Puedes continuar y volver a intentar.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const isPersonalDataComplete = user.Name.trim() !== "" && user.Phone.trim() !== "" && user.Email.trim() !== "";
  const hasFiscalData = Boolean(user.RazonSocial || user.CodigoPostal || user.Rfc || user.RegimenFiscal);
  const isFiscalComplete = !hasFiscalData || Boolean(user.RazonSocial && /^\d{5}$/.test(user.CodigoPostal || "") && /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(user.Rfc || "") && user.RegimenFiscal);
  const fiscalErrors = hasFiscalData ? [
    !user.RazonSocial?.trim() ? "razón social" : "",
    !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(user.Rfc || "") ? "RFC (12 o 13 caracteres)" : "",
    !/^\d{5}$/.test(user.CodigoPostal || "") ? "código postal (5 dígitos)" : "",
    !user.RegimenFiscal ? "régimen fiscal" : "",
  ].filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center">
      <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div><p className="text-sm font-semibold text-[#c70063]">Clientes</p><h2 className="text-lg font-bold text-slate-900 sm:text-xl">{onEdit ? "Editar cliente" : "Nuevo cliente"}</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-100">
            <img src="/icons/close.png" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
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
                    setUser((prev) => ({ ...prev, Email: event.target.value, ID_User: onEdit === undefined ? undefined : prev.ID_User }))
                  }
                  onBlur={handleEmailBlur}
                  placeholder="cliente@correo.com"
                  autoComplete="email"
                  required={hasFiscalData}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
                {isCheckingEmail && <p className="mt-1 text-xs text-slate-500">Verificando correo…</p>}
                {!isCheckingEmail && emailMessage && <p className="mt-1 text-xs text-slate-600">{emailMessage}</p>}
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
                  placeholder="Nombre completo"
                  autoComplete="name"
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
                  autoComplete="tel"
                  pattern="[0-9]{10}"
                  title="Debe contener exactamente 10 dígitos numéricos"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span>{hasFiscalData ? (isFiscalComplete ? "Ficha fiscal completa" : `Revisa: ${fiscalErrors.join(", ")}.`) : "La ficha fiscal es opcional hasta que el cliente solicite factura"}</span>
                {hasFiscalData && <button type="button" onClick={() => setUser((prev) => ({ ...prev, RazonSocial: "", CodigoPostal: "", Rfc: "", RegimenFiscal: "" }))} className="font-bold text-red-600">Limpiar</button>}
              </div>
            </div>
          )}

          {activeTab === "facturacion" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 rounded-xl border border-[#007782]/15 bg-[#007782]/5 p-3"><p className="text-sm font-bold text-slate-800">Datos para CFDI 4.0</p><p className="mt-1 text-xs text-slate-600">Deben coincidir exactamente con la constancia de situación fiscal. Si capturas uno, completa todos.</p></div>
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
                    setUser((prev) => ({ ...prev, RazonSocial: event.target.value.toUpperCase() }))
                  }
                  placeholder="Razón social"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* CP */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Código postal fiscal
                </label>
                <input
                  id="codigopostalCliente"
                  type="text"
                  value={user.CodigoPostal}
                  onChange={(event) => setUser((prev) => ({
                    ...prev,
                    CodigoPostal: event.target.value.replace(/\D/g, "").slice(0, 5)
                  }))}
                  placeholder="Código postal"
                  inputMode="numeric"
                  maxLength={5}
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
                  onChange={(event) => setUser((prev) => ({
                    ...prev,
                    Rfc: event.target.value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, "").slice(0, 13)
                  }))}
                  placeholder="RFC"
                  maxLength={13}
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
                  <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                  <option value="605">605 - Sueldos y Salarios</option>
                  <option value="606">606 - Arrendamiento</option>
                  <option value="608">608 - Demás ingresos</option>
                  <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                  <option value="616">616 - Sin obligaciones fiscales</option>
                  <option value="621">621 - Incorporación Fiscal</option>
                  <option value="625">625 - Actividades Empresariales mediante Plataformas Tecnológicas</option>
                  <option value="626">626 - Régimen Simplificado de Confianza</option>
                </select>
              </div>
            </div>
          )}

          {/* Botón */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className={`${styles.submitButton} ${
                !isPersonalDataComplete || !isFiscalComplete || isCheckingEmail ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isPersonalDataComplete || !isFiscalComplete || isCheckingEmail}
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

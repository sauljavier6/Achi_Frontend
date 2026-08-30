import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CreateSupplier, getSupplier, getSupplierById, updateSupplier } from '../../../../api/Post/suppliersApi/SuppliersApi';
import styles from "./ModalSuppliers.module.scss";

export interface Suppliers { 
  ID_User?: number;
  Name: string;
  Email: string;
  Phone: string,
  RazonSocial?: string;
  CodigoPostal?: string;
  Rfc?: string;
  RegimenFiscal?: string;
}

interface ModalCajasProps { 
  onClose: () => void;
  onSave?: (data: Suppliers) => void;
  onEdit?: number | null;
}

const ModalSuppliers = ({ onClose, onSave, onEdit }: ModalCajasProps) => {
  const [formData, setFormData] = useState<Suppliers>({
    ID_User: undefined,
    Name: "",
    Email: "",
    Phone: "",
    RazonSocial: "", CodigoPostal: "", Rfc: "", RegimenFiscal: "",
  });
  const [activeTab, setActiveTab] = useState<"contact" | "fiscal">("contact");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  const handleEmailBlur = async () => {
    const email = formData.Email.trim().toLowerCase();
    if (onEdit || !email || !/^\S+@\S+\.\S+$/.test(email)) return;
    setIsCheckingEmail(true);
    setEmailMessage("");
    try {
      const supplierData = await getSupplier(email);
      const data = supplierData?.data;
      if (!data) {
        setFormData((previous) => ({ ...previous, Email: email, ID_User: undefined }));
        setEmailMessage("Correo disponible para un proveedor nuevo.");
        return;
      }
      setFormData((previous) => ({ ...previous, ID_User: data.ID_User, Name: data.Name || previous.Name, Phone: data.Phone?.Description || previous.Phone, Email: data.Email?.Description || email, RazonSocial: data.Facturacion?.RazonSocial || "", CodigoPostal: data.Facturacion?.CodigoPostal || "", Rfc: data.Facturacion?.Rfc || "", RegimenFiscal: data.Facturacion?.RegimenFiscal || "" }));
      setEmailMessage("Proveedor existente encontrado; cargamos sus datos.");
    } catch (error) {
      console.error("Error verificando proveedor:", error);
      setEmailMessage("No fue posible verificar el correo. Puedes volver a intentarlo.");
    } finally {
      setIsCheckingEmail(false);
    }
  };



  useEffect(() => {
    if (onEdit) {
      const fetchProduct = async () => {
        try {
          const data = await getSupplierById(onEdit);
          setFormData({
            ID_User: data.ID_User,
            Name: data.Name,
            Email: data.Email.Description,
            Phone: data.Phone.Description,
            RazonSocial: data.Facturacion?.RazonSocial || "", CodigoPostal: data.Facturacion?.CodigoPostal || "", Rfc: data.Facturacion?.Rfc || "", RegimenFiscal: data.Facturacion?.RegimenFiscal || ""
          });

        } catch (error) {
          console.error("Error cargando producto:", error);
        }
      };

      fetchProduct();
    }
  }, [onEdit]);

  const queryClient = useQueryClient();

  const { mutate: createSupplier } = useMutation({
    mutationFn: CreateSupplier,
    onError: (error) => {
      toast.error(`${error.message}`, {
      position: "top-right",
      });
      },
    onSuccess: (data) => {
      onSave?.({ ...formData, ID_User: data.data.ID_User })
      handleClose()
      toast.success("Proveedor creado correctamente", {
      position: "top-right",
      progressClassName: "custom-progress",
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const { mutate: updatemutate } = useMutation({
    mutationFn: updateSupplier,
    onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
    },
    onSuccess: (data) => {
        onSave?.({ ...formData, ID_User: data.data.ID_User })
        handleClose()
        toast.success("Proveedor actualizado correctamente", {
        position: "top-right",
        progressClassName: "custom-progress",
        });
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
  setFormData({
    Name: "",
    Email: "",
    Phone: "",
    RazonSocial: "", CodigoPostal: "", Rfc: "", RegimenFiscal: "",
  });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.ID_User) {
      updatemutate(formData);
    } else {
      createSupplier(formData);
    }
  };

  const isPersonalDataComplete = formData.Name.trim() !== "" && formData.Phone.trim() !== "" && formData.Email.trim() !== "";
  const hasFiscalData = Boolean(formData.RazonSocial || formData.CodigoPostal || formData.Rfc || formData.RegimenFiscal);
  const isFiscalComplete = !hasFiscalData || Boolean(formData.RazonSocial && /^\d{5}$/.test(formData.CodigoPostal || "") && /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(formData.Rfc || "") && formData.RegimenFiscal);
  const fiscalErrors = hasFiscalData ? [
    !formData.RazonSocial?.trim() ? "razón social" : "",
    !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(formData.Rfc || "") ? "RFC (12 o 13 caracteres)" : "",
    !/^\d{5}$/.test(formData.CodigoPostal || "") ? "código postal (5 dígitos)" : "",
    !formData.RegimenFiscal ? "régimen fiscal" : "",
  ].filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div><p className="text-sm font-semibold text-[#c70063]">Proveedores</p><h2 className="text-xl font-bold text-slate-900">{onEdit ? "Editar proveedor" : "Nuevo proveedor"}</h2></div>
          <button type="button" onClick={handleClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-100">
            <img src="/icons/close.png" alt="Cerrar" className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setActiveTab("contact")} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === "contact" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}>Contacto</button><button type="button" onClick={() => setActiveTab("fiscal")} className={`rounded-lg px-3 py-2 text-sm font-bold ${activeTab === "fiscal" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}>Datos fiscales</button></div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "contact" && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Correo */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Correo
              </label>
              <input
                id="Email"
                type="email"
                value={formData.Email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, Email: event.target.value, ID_User: onEdit ? prev.ID_User : undefined }))
                }
                onBlur={handleEmailBlur}
                placeholder="proveedor@correo.com"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {isCheckingEmail && <p className="mt-1 text-xs text-slate-500">Verificando correo…</p>}
              {!isCheckingEmail && emailMessage && <p className="mt-1 text-xs text-slate-600">{emailMessage}</p>}
            </div>

            {/* Nombre */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Nombre del proveedor
              </label>
              <input
                id="Name"
                type="text"
                value={formData.Name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, Name: event.target.value }))
                }
                placeholder="Nombre o razón social"
                autoComplete="organization"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                value={formData.Phone}
                onChange={(event) => {
                  const soloNumeros = event.target.value.replace(/\D/g, '');
                  if (soloNumeros.length <= 10) {
                    setFormData((prev) => ({ ...prev, Phone: soloNumeros }));
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>}

          {activeTab === "fiscal" && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="sm:col-span-2 rounded-xl border border-[#007782]/15 bg-[#007782]/5 p-3"><p className="text-sm font-bold text-slate-800">Datos para CFDI 4.0</p><p className="text-xs text-slate-500">Deben coincidir con la constancia fiscal. La ficha es opcional, pero si capturas un dato debes completarla.</p></div><label className="text-sm font-medium text-slate-700 sm:col-span-2">Razón social<input value={formData.RazonSocial || ""} onChange={(e) => setFormData((p) => ({ ...p, RazonSocial: e.target.value.toUpperCase() }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 font-normal" placeholder="Nombre fiscal exacto" /></label><label className="text-sm font-medium text-slate-700">RFC<input value={formData.Rfc || ""} onChange={(e) => setFormData((p) => ({ ...p, Rfc: e.target.value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, "").slice(0, 13) }))} className={`mt-1 w-full rounded-xl border px-4 py-2.5 font-normal ${hasFiscalData && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(formData.Rfc || "") ? "border-red-400 bg-red-50/40" : "border-slate-300"}`} placeholder="12 o 13 caracteres" />{hasFiscalData && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(formData.Rfc || "") && <span className="mt-1 block text-xs text-red-600">Captura un RFC válido de 12 o 13 caracteres.</span>}</label><label className="text-sm font-medium text-slate-700">Código postal fiscal<input value={formData.CodigoPostal || ""} onChange={(e) => setFormData((p) => ({ ...p, CodigoPostal: e.target.value.replace(/\D/g, "").slice(0, 5) }))} inputMode="numeric" maxLength={5} className={`mt-1 w-full rounded-xl border px-4 py-2.5 font-normal ${hasFiscalData && !/^\d{5}$/.test(formData.CodigoPostal || "") ? "border-red-400 bg-red-50/40" : "border-slate-300"}`} placeholder="00000" /></label><label className="text-sm font-medium text-slate-700 sm:col-span-2">Régimen fiscal<select required={hasFiscalData} value={formData.RegimenFiscal || ""} onChange={(e) => setFormData((p) => ({ ...p, RegimenFiscal: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 font-normal"><option value="">Seleccionar</option><option value="601">601 - General de Ley Personas Morales</option><option value="603">603 - Personas Morales con Fines no Lucrativos</option><option value="605">605 - Sueldos y Salarios</option><option value="606">606 - Arrendamiento</option><option value="608">608 - Demás ingresos</option><option value="612">612 - Personas Físicas con Actividades Empresariales</option><option value="616">616 - Sin obligaciones fiscales</option><option value="621">621 - Incorporación Fiscal</option><option value="625">625 - Actividades Empresariales mediante Plataformas Tecnológicas</option><option value="626">626 - Régimen Simplificado de Confianza</option></select></label><div className={`sm:col-span-2 flex items-start justify-between gap-3 rounded-xl px-3 py-2 text-xs ${fiscalErrors.length ? "bg-amber-50 text-amber-800" : "bg-slate-50 text-slate-600"}`}><span>{hasFiscalData ? (isFiscalComplete ? "Ficha fiscal completa" : `Revisa: ${fiscalErrors.join(", ")}.`) : "Sin ficha fiscal capturada"}</span>{hasFiscalData && <button type="button" onClick={() => setFormData((p) => ({ ...p, RazonSocial: "", CodigoPostal: "", Rfc: "", RegimenFiscal: "" }))} className="shrink-0 font-bold text-red-600">Limpiar</button>}</div></div>}

          {/* Botón */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className={`${styles.submitButton} ${
                !isPersonalDataComplete || !isFiscalComplete || isCheckingEmail ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isPersonalDataComplete || !isFiscalComplete || isCheckingEmail}
            >
              Guardar proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalSuppliers;

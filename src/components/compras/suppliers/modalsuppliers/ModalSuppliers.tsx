import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CreateSupplier, getSupplier, getSupplierById, updateSupplier } from '../../../../api/Post/suppliersApi/SuppliersApi';
import styles from "./ModalSuppliers.module.scss";

interface Suppliers { 
  ID_User?: number;
  Name: string;
  Email: string;
  Phone: string,
}

interface ModalCajasProps { 
  onClose: () => void;
  onSave?: (data: number) => void;
  onEdit?: number | null;
}

const ModalSuppliers = ({ onClose, onSave, onEdit }: ModalCajasProps) => {
  const [formData, setFormData] = useState<Suppliers>({
    ID_User: undefined,
    Name: "",
    Email: "",
    Phone: "",
  });
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
      setFormData((previous) => ({ ...previous, ID_User: data.ID_User, Name: data.Name || previous.Name, Phone: data.Phone?.Description || previous.Phone, Email: data.Email?.Description || email }));
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
            Phone: data.Phone.Description
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
      onSave?.(data.data.ID_User)
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
        onSave?.(data.data.ID_User)
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
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
          </div>

          {/* Botón */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className={`${styles.submitButton} ${
                !isPersonalDataComplete || isCheckingEmail ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isPersonalDataComplete || isCheckingEmail}
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

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


  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const email = formData?.Email?.trim();

        if (!email) {
          resetUser(email);
          return;
        }

        const supplierData = await getSupplier(email);
        const data = supplierData?.data;

        if (data) {
          setFormData(prev => ({
            ...prev,
            ID_User: data.ID_User,
            Name: data.Name || "",
            Phone: data.Phone?.Description || "",
            Email: data.Email?.Description || email,
          }));
        } else {
          resetUser(email);
        }

      } catch (error) {
        console.error("Error fetching customer data:", error);
        resetUser(formData?.Email?.trim());
      }
    };

    const resetUser = (email = "") => {
      setFormData(prev => ({
        ...prev,
        ID_User: undefined,
        Name: "",
        Phone: "",
        Email: email
      }));
    };

    fetchCustomer();
  }, [formData?.Email]);



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
      toast.success("Proveedor creado con éxito", {
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
        toast.success("proveedor actualizado con éxito", {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md sm:max-w-lg md:max-w-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Crear Proveedor</h2>
          <button onClick={handleClose} className="p-2 rounded hover:bg-gray-100">
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
                  setFormData((prev) => ({ ...prev, Email: event.target.value }))
                }
                placeholder="Correo"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
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
                placeholder="Nombre del proveedor"
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
                pattern="[0-9]{10}"
                title="Debe contener exactamente 10 dígitos numéricos"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Botón */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className={`${styles.submitButton} ${
                !isPersonalDataComplete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isPersonalDataComplete}
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

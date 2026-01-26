
import { useState } from "react";
import styles from "./CustomersPage.module.scss";
import CustomersList from "../../components/sales/customers/customerslist/CustomersList";
import ModalCustomers from "../../components/sales/customers/modalcustomers/ModalCustomers";
import { postCustomerSale, putCustomerSale } from "../../api/Post/SaleApi/SaleApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteMultipleCustomers } from "../../api/Post/clientesApi/ClientesApi";
import { useAuth } from "../../hooks/useAuth";

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

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState<number[]>([]);
  const [resetChecks, setResetChecks] = useState(false);
  const { isAdmin, isTrabajador } = useAuth();

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateCustomer = () => {
    setIsEdit([])
    setModalOpen(true);
  };

  const handleEditCustomer = () => {
    setModalOpen(true);
  };

  const queryClient = useQueryClient();
  
  const { mutate: customerCreateMutate } = useMutation({
    mutationFn: postCustomerSale,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: () => {
          toast.success("Cliente registrado con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const { mutate: customerUpdateMutate } = useMutation({
    mutationFn: putCustomerSale,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: () => {
          toast.success("Cliente actualizado con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const { mutate: customerDeleteMutate } = useMutation({
    mutationFn: deleteMultipleCustomers,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: () => {
          toast.success("Cliente(s) eliminado(s) con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const handleSaveCustomer = (data: CustomerFormData) => {
    if (data.ID_User != null) {
      const payload = { ...data, ID_Sale: data.ID_User };
      customerUpdateMutate(payload);
    } else {
      customerCreateMutate(data);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setResetChecks(true);
    setIsEdit([])
  };

  const handleDelete = async () => {
    try {
      alert(`¿Estás seguro de que deseas eliminar cliente(s)?`);
      customerDeleteMutate(isEdit);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h1 className={styles.title}>Clientes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateCustomer}
            className={styles.buttonCrearProducto}
          >
            Crear
          </button>
          )}
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleEditCustomer}
            disabled={isEdit.length === 0 || isEdit.length > 1}
            className={`px-4 py-2 rounded font-semibold transition 
              ${isEdit.length === 0 || isEdit.length > 1
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            Editar
          </button>
          )}
          {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isEdit.length === 0}
            className={`px-4 py-2 rounded font-semibold transition
              ${isEdit.length === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            Eliminar
          </button>
          )} 
        </div> 
      </div>

      <CustomersList onEdit={(id) => setIsEdit(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ModalCustomers onClose={handleClose} onSave={handleSaveCustomer} onEdit={isEdit.length > 0 ? isEdit[0] : undefined}/>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;


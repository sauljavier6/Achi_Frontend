
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
          toast.success("Cliente(s) inactivado(s) sin alterar su historial", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const handleSaveCustomer = (data: CustomerFormData) => {
    if (data.ID_User != null) {
      customerUpdateMutate(data);
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
      const label = isEdit.length === 1 ? "este cliente" : `estos ${isEdit.length} clientes`;
      if (!window.confirm(`¿Deseas inactivar ${label}? Las ventas y pedidos históricos se conservarán.`)) return;
      customerDeleteMutate(isEdit);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div><p className="text-sm font-semibold text-[#c70063]">Ventas</p><h1 className="text-2xl font-bold text-slate-900">Clientes</h1><p className="text-sm text-slate-500">Consulta y actualiza los datos de tus clientes.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo"
            aria-label="Buscar clientes"
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-3 py-2 border border-gray-300 rounded-md w-full"
          />
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleCreateCustomer}
            className={styles.buttonCrearProducto}
          >
            Nuevo cliente
          </button>
          )}
          {(isAdmin || isTrabajador) && (
          <button
            onClick={handleEditCustomer}
            disabled={isEdit.length === 0 || isEdit.length > 1}
            className={`px-4 py-2 rounded font-semibold transition 
              ${isEdit.length === 0 || isEdit.length > 1
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'rounded-xl bg-[#007782] text-white hover:bg-[#00636c]'}`}
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
                : 'rounded-xl border border-red-600 bg-red-600 text-white hover:bg-red-700'}`}
          >
            Inactivar
          </button>
          )} 
        </div> 
      </div>

      <CustomersList onEdit={(id) => setIsEdit(id)} resetChecks={resetChecks}
      onResetComplete={() => setResetChecks(false)} searchTerm={searchTerm}/>

      {modalOpen && (
        <ModalCustomers key={isEdit.length > 0 ? `edit-${isEdit[0]}` : "new"} onClose={handleClose} onSave={handleSaveCustomer} onEdit={isEdit.length > 0 ? isEdit[0] : undefined}/>
      )}
    </section>
  );
};

export default CustomersPage;


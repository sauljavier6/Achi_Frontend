import { useEffect, useState } from "react";
import styles from "./CajasPays.module.scss";
import ModalCustomers from "../../sales/customers/modalcustomers/ModalCustomers";
import { getSaleById, postCustomerWithSale, postPaymentSale, putCustomerSale } from "../../../api/Post/SaleApi/SaleApi";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient  } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getPayments } from "../../../api/Post/PaymentApi/PaymentApi";
import { sendTicket } from "../../../api/Post/TicketApi/TicketApi";

interface SaleProduct {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface PaymentSale {
  ID_SalePayment?: number;
  ID_Payment: number;
  Description: string;
  Monto: number;
  ReferenceNumber: string;
}

interface CustomerFormData {
  ID_User?: number;
  Name: string;
  Phone: string;
  Email: string;
  razonSocial?: string;
  codigoPostal?: string;
  rfc?: string;
  regimenFiscal?: string;
}

interface CajasProps {
  ID_Sale: number;
}

  export default function CajasPays({ ID_Sale }: CajasProps) {
    const [products, setProducts] = useState<SaleProduct[]>([]);
    const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<PaymentSale[]>([]);
    const [idSale, setIdSale] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [selectedProductsDelete, setSelectedProductsDelete] = useState<number[]>([]);
    const allSelected = products.length > 0 && products.every((p) => selectedProductsDelete.includes(p.id));
    const [modalOpen, setModalOpen] = useState(false);

    const { data: paymentsData } = useQuery({
      queryKey: ['payments'],
      queryFn: getPayments,
    });

    const { data } = useQuery({
      queryKey: ['sale', ID_Sale],
      queryFn: () => getSaleById(ID_Sale),
      enabled: ID_Sale !== null && ID_Sale !== undefined,
    });

    useEffect(() => {
      if (data) {
        const mappedProducts: SaleProduct[] = data.SaleProduct.map((item: any) => ({
          id: item.ID_SaleProduct,
          productId: item.ID_Product,
          name: item.Product.Description + ' - ' + item.Stock.Description,
          quantity: item.Quantity,
          price: item.Saleprice,
        }));
        setProducts(mappedProducts);

        const datacustomer = {
          ID_User: data.Cliente?.ID_User || "",
          Name: data.Cliente?.Name || "",
          Phone: data.Cliente?.Phone?.Description || "",
          Email: data.Cliente?.Email?.Description || "",
          razonSocial: data.Facturacion?.razonSocial || "",
          codigoPostal: data.Facturacion?.codigoPostal || "",
          rfc: data.Facturacion?.rfc || "",
          regimenFiscal: data.Facturacion?.regimenFiscal || "",
        };
        setCustomerData(datacustomer);

        const datapay = data.PaymentSale.map((pago: any) => ({
          ID_SalePayment: pago.ID_PaymentSale,
          ID_Payment: pago.Payment.ID_Payment,
          Description: pago.Payment.Description,
          Monto: pago.Monto,
          ReferenceNumber: pago.ReferenceNumber
        }));

        setSelectedPayment(datapay);
      }
    }, [data]);

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
      mutationFn: postPaymentSale,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: () => {
          toast.success("Pago registrado con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sale'] });
      },
    });

    const { mutate: customerCreateMutate } = useMutation({
      mutationFn: postCustomerWithSale,
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
          queryClient.invalidateQueries({ queryKey: ['sale'] });
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
          queryClient.invalidateQueries({ queryKey: ['sale'] });
      },
    });

    const { mutate: sendTiket } = useMutation({
      mutationFn: sendTicket,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: () => {
          setIdSale(null);
          toast.success("Ticket enviado con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sale'] });
      },
    });

    const handleCreateCustomer = () => {
      setModalOpen(true);
    };

    const handleSaveCustomer = (data: CustomerFormData) => {
      const extendedData = {
        ...data,
        ID_Sale
      };

      if (data.ID_User != null) {
        customerUpdateMutate(extendedData);
      } else {
        customerCreateMutate(extendedData);
      }
    };


    const handleAddPayment = () => {
      if (!paymentMethod || !amount) return;

      const selectedPaymentData = paymentsData.data.find(
        (p: PaymentSale) => p.ID_Payment === Number(paymentMethod)
      );

      setSelectedPayment((prev) => [
        ...prev,
        {
          ID_Payment: Number(paymentMethod),
          Description: selectedPaymentData?.Description || "",
          Monto: parseFloat(amount),
          ReferenceNumber: reference || "",
        },
      ]);

      // Limpiar campos
      setPaymentMethod("");
      setAmount("");
      setReference("");
    };

    const handleDeletePayment = (index: number) => {
      setSelectedPayment((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImpresTicket = async () => {
      try {
        window.open(`${import.meta.env.VITE_API_URL}/ticket/${idSale}`, "_blank");
        setIdSale(null);
      } catch (error) {
        console.error("Error al imprimir el ticket:", error);
      }
    };

    const handleSendTicket = () => {
      console.log("Imprimir ticket", idSale);
      if (idSale !== null) {
        sendTiket(idSale);
      }
    }; 

    const handleSavePay = async () => {
      const filteredPayments = selectedPayment.filter(p => p.ID_SalePayment === undefined);

      const data = {
        ID_Sale,
        Payment: filteredPayments,
      };

      mutate(data);
    };

    return (
      <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
        
        <div className="border rounded p-4 mb-4 overflow-x-auto">
          <h3 className="font-semibold mb-2">Productos en venta</h3>

          {/* Vista tabla en pantallas medianas y grandes */}
          <table className="hidden sm:table w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductsDelete(products.map((p) => p.id));
                      } else {
                        setSelectedProductsDelete([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left">Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProductsDelete.includes(p.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedProductsDelete((prev) =>
                          checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                        );
                      }}
                    />
                  </td>
                  <td className="py-1">{p.name}</td>
                  <td className="text-center">{p.quantity}</td>
                  <td className="text-center">${p.price}</td>
                  <td className="text-center">${(p.price * p.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Vista tipo cards en móviles */}
          <div className="sm:hidden space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="border rounded-lg p-3 shadow-sm flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProductsDelete.includes(p.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedProductsDelete((prev) =>
                          checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                        );
                      }}
                    />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <span className="text-gray-700 font-semibold">
                    ${p.price}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Cantidad:</span>
                  <span className="text-gray-800">{p.quantity}</span>
                </div>

                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="text-green-600 font-semibold">
                    ${(p.price * p.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-wrap md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="text-sm w-full md:flex-1 md:min-w-[200px]">
            <p>Subtotal: ${data?.Subtotal}</p>
            <p>IVA: ${data?.Iva}</p>
            <p className="font-semibold">Total: ${data?.Total}</p>
            <p className="font-semibold">Balance Total: ${data?.Balance_Total}</p>
          </div>
          <button onClick={handleCreateCustomer} className={styles.buttonAgregarCliente}>
            + Agregar cliente
          </button>
        </div>

        <div className="flex flex-col md:flex-wrap md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="text-sm w-full md:flex-1 md:min-w-[200px]">
            <select
              id="metodoPago"
              name="metodoPago"
              className="border rounded px-3 py-2 w-full"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Selecciona un método de pago</option>
              {paymentsData?.data?.map((payment: any) => (
                <option key={payment.ID_Payment} value={payment.ID_Payment}>
                  {payment.Description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {paymentMethod && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
                Monto del pago
              </label>
              <input
                type="number"
                id="paymentAmount"
                name="paymentAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej. 500.00"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                Número de referencia/Notas
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. #REF1234"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="col-span-full">
              <button
                type="button"
                onClick={handleAddPayment}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Agregar pago
              </button>
            </div>
          </div>
        )}

        {selectedPayment.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Pagos agregados:</h3>

            <div className="hidden md:grid grid-cols-4 gap-4 font-semibold text-gray-700 border-b pb-1 mb-2">
              <span>Método</span>
              <span>Monto</span>
              <span>Referencia</span>
              <span>Acción</span>
            </div>

            <div className="space-y-2">
              {selectedPayment.map((p, i) => (
                <div
                  key={i}
                  className="grid md:grid-cols-4 gap-4 bg-gray-50 p-2 rounded border text-sm items-center"
                >
                  <div className="flex md:block justify-between">
                    <span className="font-medium md:hidden">Método: </span>
                    <span>{p.Description}</span>
                  </div>

                  <div className="flex md:block justify-between">
                    <span className="font-medium md:hidden">Monto: </span>
                    <span>${p.Monto}</span>
                  </div>

                  <div className="flex md:block justify-between">
                    <span className="font-medium md:hidden">Referencia: </span>
                    <span>{p.ReferenceNumber || "—"}</span>
                  </div>

                  <div className="flex md:block justify-between">
                    <span className="font-medium md:hidden">Acción: </span>
                    <button
                      disabled={p.ID_SalePayment !== undefined}
                      onClick={() => handleDeletePayment(i)}
                      className={`${
                        p.ID_SalePayment !== undefined
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:underline"
                      }`}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        )}

        <div className="flex flex-col sm:flex-row flex-wrap mt-10 gap-2 sm:justify-end w-full">
          <button
            className={`bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!idSale}
          >
            Facturar
          </button>
          <button
            onClick={handleImpresTicket}
            className={`bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!idSale}
          >
            Imprimir ticket
          </button>
          <button
            onClick={handleSendTicket}
            className={`bg-yellow-500 text-white font-semibold py-2 px-4 rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!idSale}
          >
            Enviar por correo
          </button>
          <button onClick={handleSavePay} disabled={selectedPayment.length === 0} className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Completar
          </button>
        </div>
        

        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ModalCustomers onClose={() => setModalOpen(false)} onSave={handleSaveCustomer} onEdit={customerData?.ID_User}/>
          </div>
        )}
      </div>
    );
  };


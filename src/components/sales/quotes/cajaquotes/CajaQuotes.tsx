import { useEffect, useState } from "react";
import styles from "./CajaQuotes.module.scss";
import ModalCustomers from "../../../sales/customers/modalcustomers/ModalCustomers";
import { postCustomerSale, searchProducts } from "../../../../api/Post/SaleApi/SaleApi";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient  } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getStates } from "../../../../api/Post/StateApi/StateApi";
import { getPayments } from "../../../../api/Post/PaymentApi/PaymentApi";
import { sendCotizacion } from "../../../../api/Post/TicketApi/TicketApi";
import { getQuoteById, postQuote, updateQuote } from "../../../../api/Post/QuotesApi/QuotesApi";
import { getAuthUser } from "../../../../utils/auth";

interface SaleProduct {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  maxAmount: number;
  stockVariant?: string;
  iva: number;
}

interface SaleItem {
  productId: number;
  stockId: number;
  quantity: number;
  price: number;
  subtotal: number;
}

interface PaymentSale {
  ID_Payment: number;
  Description: string;
  Monto: number;
  ReferenceNumber: string;
}

interface SaleData {
  ID_User: number;
  Total: number;
  Balance_Total: number;
  Subtotal: number;
  Iva: number;
  ID_State: number;
  Payment: PaymentSale[];
  ID_Operador: number;
  Lote: string;
  items: SaleItem[];
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
  ID_Sale?: number;
}

  export default function CajasQuotes({ ID_Sale }: CajasProps) {
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState(search);
    const [products, setProducts] = useState<SaleProduct[]>([]);
    const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
    const [selectedState, setSelectedState] = useState(2);
    const [selectedPayment, setSelectedPayment] = useState<PaymentSale[]>([]);
    const [idSale, setIdSale] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [selectedProductsDelete, setSelectedProductsDelete] = useState<number[]>([]);
    const allSelected = products.length > 0 && products.every((p) => selectedProductsDelete.includes(p.id));
    const [modalOpen, setModalOpen] = useState(false);

    const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const iva = products.reduce((sum, p) => sum + (p.price * p.quantity * p.iva), 0);
    const total = subtotal + iva;

    const usuario = getAuthUser();
    const idusuario = usuario?.ID_User;

    useEffect(() => {
      if (ID_Sale) {
        const fetchSale = async () => {
          try {
            const datasale = await getQuoteById(ID_Sale);
            const data = datasale.data;
            console.log(data)
            //estado para el cliente
            setCustomerData(data?.user);

            //estado para los productos
            const mappedProducts: SaleProduct[] = data.SaleProduct.map((item: any) => ({
              id: item.Stock?.ID_Stock,
              maxAmount: item.Stock?.Amount,
              productId: item.ID_Product,
              name: item.Product.Description + ' - ' + item.Stock.Description,
              quantity: item.Quantity,
              price: item.Saleprice,
              iva: item.Product.Iva.Iva,
            }));
            setProducts(mappedProducts);

          } catch (error) {
            console.error('Error al obtener la venta:', error);
          }
        };

        fetchSale();
      }
    }, [ID_Sale]);


    useEffect(() => {
      const timeout = setTimeout(() => setDebounced(search), 300);
      return () => clearTimeout(timeout);
    }, [search]);

    const { data, isLoading } = useQuery({
      queryKey: ['search', debounced],
      queryFn: () => searchProducts(debounced || ''),
      enabled: debounced.length > 0,
    });

    const { data: states } = useQuery({
      queryKey: ['states'],
      queryFn: getStates,
    });

    const { data: paymentsData } = useQuery({
      queryKey: ['payments'],
      queryFn: getPayments,
    });

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
      mutationFn: postQuote,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: (data) => {
          setIdSale(data.data.ID_Sale)
          setCustomerData(null);
          setProducts([]);
          setSelectedPayment([])
          setPaymentMethod("");
          setAmount("");
          setReference("");
          toast.success("Cotización registrada con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sale'] });
      },
    });

    const { mutate: mutateEditSale } = useMutation({
      mutationFn: updateQuote,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: (data) => {
          setIdSale(data.data.ID_Sale)
          setCustomerData(null);
          setProducts([]);
          setSelectedPayment([])
          setPaymentMethod("");
          setAmount("");
          setReference("");
          toast.success("Venta completada con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sale'] });
      },
    });

    const { mutate: customerCreateMutate } = useMutation({
      mutationFn: postCustomerSale,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: (data) => {
          setCustomerData(data.data);
          toast.success("Cliente registrado con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['customersale'] });
      },
    });

    const { mutate: sendTiket } = useMutation({
      mutationFn: sendCotizacion,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: () => {
          toast.success("Cotizacion enviada con éxito", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sendticket'] });
      },
    });

    const handleSaveSale = async () => {
      if (products.length === 0) {
        alert("Debes seleccionar productos para completar la venta.");
        return;
      }

      const saleData: SaleData = {
        ...(ID_Sale ? { ID_Sale } : {}),
        ID_User: customerData?.ID_User ?? 0,
        Total: total,
        Balance_Total: total,
        Subtotal: subtotal,
        Iva: iva,
        ID_State: selectedState,
        ID_Operador: Number(idusuario),
        Lote: '',
        Payment: selectedPayment.map(p => ({
          ID_Payment: p.ID_Payment,
          Description: p.Description,
          Monto: p.Monto,
          ReferenceNumber: p.ReferenceNumber,
        })),
        items: products.map(p => ({
          productId: p.productId,
          stockId: p.id,
          quantity: p.quantity,
          price: p.price,
          subtotal: p.price * p.quantity,
        })),
      };

      if (ID_Sale) {
        // Modo edición
        console.log('dentro de edicion')
        await mutateEditSale(saleData);
      } else {
        await mutate(saleData);
      }
    };

    const handleCreateCustomer = () => {
      setModalOpen(true);
    };

    const handleSaveCustomer = (data: CustomerFormData) => {
      setIdSale(null);
      if (data.ID_User != null) {
        console.log("guardando cliente", data);
        setCustomerData(data);
      } else {
        console.log("Creando nuevo cliente", data);
        customerCreateMutate(data);
      }
    };

    const handleAddPayment = () => {
      setIdSale(null);
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
        window.open(`${import.meta.env.VITE_API_URL}/ticket/Cotizacion/${idSale}`, "_blank");
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

    return (
      <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
        <div className="mb-4 relative">
          <div className="flex justify-between items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="border rounded px-3 py-2 w-full mr-2"
            />
            <button
              onClick={() => {
                setProducts((prev) =>
                  prev.filter((p) => !selectedProductsDelete.includes(p.id))
                );
                setSelectedProductsDelete([]);
              }}
              className={styles.removeButton}
            >
              Quitar
            </button>
          </div>

          {data?.map((product:any) => (
            <li
              key={product.ID_Product}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer list-none"
            >
              <span>{product.Description} - {product.Code}</span>
              <ul className="pl-4">
                {product.Stock?.map((variant:any) => (
                  <li
                    key={variant.ID_Stock}
                    onClick={() => {
                      setIdSale(null)
                      setProducts(prev => {
                        const exists = prev.find(p => p.id === variant.ID_Stock);

                        if (exists) {
                          if (exists.quantity < variant.Amount) {
                            return prev.map(p =>
                              p.id === variant.ID_Stock
                                ? { ...p, quantity: p.quantity + 1 }
                                : p
                            );
                          } else {
                            alert(`No puedes agregar más. Stock disponible: ${variant.Amount}`);
                            return prev;
                          }
                        }

                        if (variant.Amount > 0) {
                          return [
                            ...prev,
                            {
                              id: variant.ID_Stock,
                              productId: product.ID_Product,
                              name: `${product.Description} - ${variant.Description}`,
                              quantity: 1,
                              price: variant.Saleprice,
                              maxAmount: variant.Amount,
                              stockVariant: variant.Description,
                              iva: product.Iva.Iva,
                            }
                          ];
                        } else {
                          alert("Stock no disponible");
                          return prev;
                        }
                      });

                      setSearch('');
                    }}

                    className="py-1 pl-4 hover:bg-gray-200 cursor-pointer"
                  >
                    Variante: {variant.Description} - ${variant.Saleprice}
                  </li>
                ))}
              </ul>
            </li>
          ))}

          {search.length > 0 && !isLoading && data?.length === 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10 px-4 py-2 text-gray-500">
              No se encontraron productos.
            </div>
          )}
        </div>

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
                  <td className="text-center">
                    <input
                      type="number"
                      min={1}
                      max={p.maxAmount || 999}
                      value={p.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === p.id ? { ...item, quantity: newQuantity } : item
                          )
                        );
                      }}
                      className="w-16 text-center border rounded px-1 py-0.5"
                    />
                  </td>
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
                className="border rounded-lg p-3 shadow-sm flex flex-col gap-2 divide-y"
              >
                <div className="flex justify-between items-center pb-2">
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
                  <span className="text-gray-700 font-semibold">${p.price}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Cantidad:</span>
                  <input
                    type="number"
                    min={1}
                    max={p.maxAmount || 999}
                    value={p.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value);
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id ? { ...item, quantity: newQuantity } : item
                        )
                      );
                    }}
                    className="w-20 text-center border rounded px-1 py-0.5"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
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
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>IVA: ${iva.toFixed(2)}</p>
            <p className="font-semibold">Total: ${total.toFixed(2)}</p>
          </div>
          <button onClick={handleCreateCustomer} className={styles.buttonAgregarCliente}>
            + Agregar cliente
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:flex-wrap justify-between items-start md:items-center gap-4 mb-4">
          {ID_Sale && (
            <>
              <div className="text-sm w-full md:flex-1 md:min-w-[200px]">
                <select
                  id="tipoPago"
                  name="tipoPago"
                  className="border rounded px-3 py-2 w-full"
                  value={selectedState}
                  onChange={(e) => setSelectedState(Number(e.target.value))}
                >
                  <option value="" disabled>
                    Selecciona un estado
                  </option>

                  {isLoading && <option>Cargando...</option>}

                  {states?.map((state: any) => (
                    <option key={state.ID_State} value={state.ID_State}>
                      {state.Description}
                    </option>
                  ))}
                </select>
              </div>

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
            </>
          )}
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
                    <span>${p.Monto.toFixed(2)}</span>
                  </div>

                  <div className="flex md:block justify-between">
                    <span className="font-medium md:hidden">Referencia: </span>
                    <span>{p.ReferenceNumber || "—"}</span>
                  </div>

                  <div className="flex md:block justify-between">
                    <span className="font-medium md:hidden">Acción: </span>
                    <button
                      onClick={() => handleDeletePayment(i)}
                      className="text-red-600 hover:underline"
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
            onClick={handleImpresTicket}
            className={`bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!idSale}
          >
            Imprimir Ticket
          </button>
          <button
            onClick={handleSendTicket}
            className={`bg-yellow-500 text-white font-semibold py-2 px-4 rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!idSale}
          >
            Enviar por correo
          </button>
          <button onClick={handleSaveSale} className={styles.buttonAgregarCliente}>
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


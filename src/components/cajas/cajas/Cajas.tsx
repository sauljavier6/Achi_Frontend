import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Cajas.module.scss";
import ModalCustomers from "../../sales/customers/modalcustomers/ModalCustomers";
import { postCustomerSale, postSale, searchProducts } from "../../../api/Post/SaleApi/SaleApi";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient  } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getStates } from "../../../api/Post/StateApi/StateApi";
import { getPayments } from "../../../api/Post/PaymentApi/PaymentApi";
import { openTicket, sendTicket } from "../../../api/Post/TicketApi/TicketApi";
import { createRetiro } from "../../../api/Post/RetiroApi/RetiroApi";
import { getAuthUser } from "../../../utils/auth";
import { lineTotal, numericValue, taxRate, useSaleProducts } from "../../../utils/saleSummary";
import { getQuoteById, searchQuotesForCheckout } from "../../../api/Post/QuotesApi/QuotesApi";
import { formatFolio } from "../../../utils/folio";

interface SaleProduct {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  maxAmount?: number;
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
  Envio?: number;
  ID_State: number;
  Payment: PaymentSale[];
  ID_Operador: number;
  Lote: string;
  items: SaleItem[];
  IsCredit?: boolean;
  SourceQuoteId?: number;
}

interface LoadedQuote {
  ID_Sale: number;
  Total: number;
  QuoteExpiresAt?: string | null;
  customerName?: string;
  customerId?: number;
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
  Lote: string;
}

const normalizePaymentName = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase();

  export default function Cajas({ Lote }: CajasProps) {
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState(search);
    const [products, setProducts, saleSummary] = useSaleProducts<SaleProduct>();
    const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
    const [selectedState, setSelectedState] = useState(2);
    const [selectedPayment, setSelectedPayment] = useState<PaymentSale[]>([]);
    const [idSale, setIdSale] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [saleMode, setSaleMode] = useState<"cash" | "credit">("cash");
    const [searchMode, setSearchMode] = useState<"product" | "quote">("product");
    const [loadedQuote, setLoadedQuote] = useState<LoadedQuote | null>(null);
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const quoteLoadLockRef = useRef(false);
    const autoQuoteAttemptRef = useRef(0);


    const [selectedProductsDelete, setSelectedProductsDelete] = useState<number[]>([]);
    const allSelected = products.length > 0 && products.every((p) => selectedProductsDelete.includes(p.id));
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"caja" | "retiro">("caja");

    const { itemCount, subtotal, iva, total } = saleSummary;
    const paidTotal = selectedPayment.reduce((sum, payment) => sum + Number(payment.Monto), 0);
    const remaining = Math.max(0, total - paidTotal);

    const usuario = getAuthUser();
    const idusuario = usuario?.ID_User;

    useEffect(() => {
      const timeout = setTimeout(() => setDebounced(search), 300);
      return () => clearTimeout(timeout);
    }, [search]);

    const { data, isLoading } = useQuery({
      queryKey: ['search', debounced],
      queryFn: () => searchProducts(debounced || ''),
      enabled: searchMode === "product" && debounced.length > 0 && !loadedQuote,
    });

    const { data: quoteSearchData, isLoading: isSearchingQuotes } = useQuery({
      queryKey: ['quote-checkout-search', debounced],
      queryFn: () => searchQuotesForCheckout(debounced),
      enabled: searchMode === "quote" && debounced.trim().length > 0 && !loadedQuote,
    });

    const handleLoadQuote = useCallback(async (quoteId: number) => {
      if (quoteLoadLockRef.current) return;
      quoteLoadLockRef.current = true;
      setIsLoadingQuote(true);
      try {
        const response = await getQuoteById(quoteId);
        const quote = response.data;
        if (quote.DocumentStatus !== "ACTIVE" || quote.ConvertedSaleId) {
          throw new Error(`La cotización ya fue convertida${quote.ConvertedSaleId ? ` en la venta #${quote.ConvertedSaleId}` : ""}`);
        }
        if (quote.QuoteExpiresAt && new Date(quote.QuoteExpiresAt).getTime() < Date.now()) {
          throw new Error("La cotización está vencida. Actualízala antes de cobrarla.");
        }
        const mappedProducts: SaleProduct[] = (quote.SaleProduct ?? []).map((item: any) => ({
          id: Number(item.ID_Stock),
          productId: Number(item.ID_Product),
          name: `${item.Product?.Description || "Producto"} - ${item.Stock?.Description || "Presentación"}`,
          quantity: Number(item.Quantity),
          price: Number(item.Saleprice),
          maxAmount: Number(item.Stock?.Amount ?? 0),
          stockVariant: item.Stock?.Description,
          iva: Number(item.TaxRate ?? item.Product?.Iva?.Iva ?? 0),
        }));
        if (!mappedProducts.length) throw new Error("La cotización no contiene productos");
        const unavailable = mappedProducts.find((product) => !product.maxAmount || product.quantity > Number(product.maxAmount));
        if (unavailable) throw new Error(`No hay stock suficiente para ${unavailable.name}`);
        setProducts(mappedProducts);
        setCustomerData(quote.user ?? null);
        setLoadedQuote({
          ID_Sale: Number(quote.ID_Sale),
          Total: Number(quote.Total),
          QuoteExpiresAt: quote.QuoteExpiresAt,
          customerName: quote.user?.Name,
          customerId: quote.user?.ID_User ? Number(quote.user.ID_User) : undefined,
        });
        setSelectedPayment([]);
        setPaymentMethod("");
        setAmount("");
        setSearch("");
        setSearchMode("quote");
        setIdSale(null);
        toast.success(`Cotización ${formatFolio(quote.ID_Sale)} cargada en Caja`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No fue posible cargar la cotización");
      } finally {
        setIsLoadingQuote(false);
        quoteLoadLockRef.current = false;
      }
    }, [setProducts]);

    useEffect(() => {
      const quoteId = Number(new URLSearchParams(window.location.search).get("quote") || 0);
      if (quoteId > 0 && !loadedQuote && autoQuoteAttemptRef.current !== quoteId) {
        autoQuoteAttemptRef.current = quoteId;
        void handleLoadQuote(quoteId);
      }
    }, [handleLoadQuote, loadedQuote]);

    const clearLoadedQuote = () => {
      setLoadedQuote(null);
      setProducts([]);
      setCustomerData(null);
      setSelectedPayment([]);
      setSearch("");
      window.history.replaceState({}, "", window.location.pathname);
    };

    const { data: states } = useQuery({
      queryKey: ['states'],
      queryFn: getStates,
    });

    const { data: paymentsData } = useQuery({
      queryKey: ['payments'],
      queryFn: getPayments,
    });
    const availablePaymentMethods = (paymentsData?.data ?? []).filter(
      (payment: PaymentSale) => normalizePaymentName(payment.Description) !== "credito",
    );
    const selectedPaymentDescription = paymentsData?.data?.find((payment: PaymentSale) => payment.ID_Payment === Number(paymentMethod))?.Description || "";
    const isCashPayment = selectedPaymentDescription.toLowerCase().includes("efectivo");
    const tenderedAmount = Number(amount || 0);
    const change = isCashPayment ? Math.max(0, tenderedAmount - remaining) : 0;
    const paymentCovered = products.length > 0 && (saleMode === "credit" ? Boolean(customerData?.ID_User) : remaining <= 0.009);

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
      mutationFn: postSale,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: (data) => {
          const successMessage = loadedQuote
            ? `Cotización ${formatFolio(loadedQuote.ID_Sale)} convertida en venta ${formatFolio(data.data.ID_Sale)}`
            : saleMode === "credit"
              ? `Venta a crédito ${formatFolio(data.data.ID_Sale)} registrada correctamente`
              : `Venta ${formatFolio(data.data.ID_Sale)} cobrada correctamente`;
          setIdSale(data.data.ID_Sale)
          setCustomerData(null);
          setProducts([]);
          setSelectedPayment([])
          setPaymentMethod("");
          setAmount("");
          setReference("");
          setSaleMode("cash");
          setLoadedQuote(null);
          window.history.replaceState({}, "", window.location.pathname);
          toast.success(successMessage, {
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
          toast.success("Cliente creado y asignado a la venta", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['customersale'] });
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
          toast.success("Ticket de venta enviado por correo", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sendticket'] });
      },
    });

    const handleSaveSale = async () => {
      if (products.length === 0) {
        toast.warn("Agrega al menos un producto antes de cobrar.");
        return;
      }
      if (saleMode === "credit" && !customerData?.ID_User) {
        toast.warn("Selecciona un cliente para registrar una venta a crédito.");
        return;
      }
      if (saleMode === "cash" && !paymentCovered) {
        toast.warn(`Falta registrar ${remaining.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} para completar la venta.`);
        return;
      }

      const saleData: SaleData = {
        ID_User: customerData?.ID_User ?? 0,
        Total: total,
        Balance_Total: total,
        Subtotal: subtotal,
        Iva: iva,
        Envio: 0,
        ID_State: selectedState,
        ID_Operador: Number(idusuario),
        Lote: Lote,
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
        IsCredit: saleMode === "credit",
        SourceQuoteId: loadedQuote?.ID_Sale,
      };

      if (saleMode === "credit" && !window.confirm(`¿Registrar venta a crédito por ${total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} a nombre de ${customerData?.Name}?`)) return;

      mutate(saleData);
    };


    const handleCreateCustomer = () => {
      setModalOpen(true);
    };

    const handleSaveCustomer = (data: CustomerFormData) => {
      if (data.ID_User != null) {
        setCustomerData(data);
      } else {
        customerCreateMutate(data);
      }
    };

    const handleAddPayment = () => {
      if (!paymentMethod || !amount) return;
      const enteredAmount = Number(amount);
      if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
        toast.warn("Ingresa un monto válido.");
        return;
      }
      if (!isCashPayment && enteredAmount > remaining + 0.009) {
        toast.warn("El pago no puede superar el saldo pendiente.");
        return;
      }

      const selectedPaymentData = paymentsData.data.find(
        (p: PaymentSale) => p.ID_Payment === Number(paymentMethod)
      );

      setSelectedPayment((prev) => [
        ...prev,
        {
          ID_Payment: Number(paymentMethod),
          Description: selectedPaymentData?.Description || "",
          Monto: isCashPayment ? Math.min(enteredAmount, remaining) : enteredAmount,
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
        if (!idSale) {
          toast.info("Primero registra una venta para generar el ticket.");
          return;
        }
        await openTicket(idSale);
      } catch (error) {
        console.error("Error al imprimir el ticket:", error);
        toast.error("No fue posible abrir el ticket de la venta.");
      }
    };

    const handleSendTicket = () => {
      if (idSale !== null) {
        sendTiket(idSale);
      }
    };

    // Función para manejar el retiro de dinero
    const [idRetiro, setIdRetiro] = useState<number | null>(null);
    const [dataRetiro, setdataRetiro] = useState({
      Amount: "",
      Description: "",
      Payment: "",
      Batch: Lote,
      ID_Operador: idusuario,
    });

    const handleSaveRetiro = () => {
      console.log("Datos del formulario:", dataRetiro);

      createRetiromutate({
        ...dataRetiro,
        ID_Operador: String(idusuario),
      })
    };


    const { mutate: createRetiromutate } = useMutation({
      mutationFn: createRetiro,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: (data) => {
              setIdRetiro(data.data.ID_Sale)
              setdataRetiro({
                Amount: "",
                Description: "",
                Payment: "",
                Batch: Lote,
                ID_Operador: idusuario,
              });
          toast.success("Retiro de caja registrado correctamente", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sale'] });
      },
    });

    const isFormValid = Number(dataRetiro.Amount) > 0 && dataRetiro.Description.trim() !== "" && dataRetiro.Payment !== "";

    return (
      <div className="w-full">
        
        {/* Encabezado */}
        <div className="mb-6 grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm sm:w-72">
          <button
            type="button"
            onClick={() => setActiveTab("caja")}
            className={`rounded-lg px-4 py-2.5 font-semibold transition ${activeTab === "caja" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Caja
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("retiro")}
            className={`rounded-lg px-4 py-2.5 font-semibold transition ${activeTab === "retiro" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Retiro
          </button>
        </div>

        {activeTab === "caja" && (  
        <>
        <div className="mb-4 relative">
          {loadedQuote && <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#007782]/25 bg-[#007782]/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-[#007782]">Cotización cargada</p><p className="font-bold text-slate-900">Cotización {formatFolio(loadedQuote.ID_Sale)}{loadedQuote.customerName ? ` · ${loadedQuote.customerName}` : ""}</p><p className="text-sm text-slate-600">Se respetarán sus precios e impuestos. Las partidas no pueden modificarse durante el cobro.</p></div><button type="button" onClick={clearLoadedQuote} className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">Quitar cotización</button></div>}
          <div className="mb-2 flex items-center justify-between gap-3"><label className="block text-sm font-semibold text-slate-700">Agregar a la venta</label><div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs"><button type="button" disabled={Boolean(loadedQuote)} onClick={() => { setSearchMode("product"); setSearch(""); }} className={`rounded-lg px-3 py-1.5 font-semibold ${searchMode === "product" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}>Productos</button><button type="button" disabled={Boolean(loadedQuote)} onClick={() => { setSearchMode("quote"); setSearch(""); }} className={`rounded-lg px-3 py-1.5 font-semibold ${searchMode === "quote" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}>Cotización</button></div></div><div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={Boolean(loadedQuote)}
              placeholder={searchMode === "product" ? "Buscar producto o escanear código..." : "Folio, COT-123 o nombre del cliente..."}
              className="min-h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-[#c70063] focus:ring-4 focus:ring-[#c70063]/10"
            />
            <button
              onClick={() => {
                setProducts((prev) =>
                  prev.filter((p) => !selectedProductsDelete.includes(p.id))
                );
                setSelectedProductsDelete([]);
              }}
              disabled={selectedProductsDelete.length === 0 || Boolean(loadedQuote)}
              className="rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Quitar
            </button>
          </div>

          {search.trim().length > 0 && !loadedQuote && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
              {searchMode === "product" && isLoading && <div className="px-3 py-4 text-sm text-slate-500">Buscando productos…</div>}
              {searchMode === "product" && !isLoading && data?.map((product:any) => (
                <div key={product.ID_Product} className="border-b border-slate-100 py-1 last:border-0">
                  <div className="px-3 py-2">
                    <p className="font-bold text-slate-900">{product.Description}</p>
                    {product.Code && <p className="text-xs text-slate-500">Código: {product.Code}</p>}
                  </div>
                  <div className="space-y-1">
                    {product.Stock?.map((variant:any) => (
                      <button
                        type="button"
                        key={variant.ID_Stock}
                        disabled={Number(variant.Amount) <= 0}
                        onClick={() => {
                      setIdSale(null);
                      setProducts((prev) => {
                        const exists = prev.find(p => p.id === variant.ID_Stock);
                        if (exists) {
                          if (exists.quantity >= Number(variant.Amount)) {
                            toast.warn("No hay más unidades disponibles de esta presentación.");
                            return prev;
                          }
                          return prev.map(p =>
                            p.id === variant.ID_Stock
                              ? { ...p, quantity: p.quantity + 1 }
                              : p
                          );
                        } else {
                          return [
                            ...prev,
                            {
                              id: variant.ID_Stock,
                              productId: product.ID_Product,
                              name: `${product.Description} - ${variant.Description}`,
                              quantity: 1,
                              price: numericValue(variant.Saleprice),
                              maxAmount: numericValue(variant.Amount),
                              stockVariant: variant.Description,
                              iva: taxRate(product.Iva?.Iva),
                            }
                          ];
                        }
                      });
                      setSearch('');
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#c70063]/5 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <span><span className="block font-semibold text-slate-800">{variant.Description || "Presentación general"}</span><span className="text-xs text-slate-500">Stock: {variant.Amount}</span></span>
                        <strong className="shrink-0 text-[#c70063]">${Number(variant.Saleprice).toFixed(2)}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {searchMode === "product" && !isLoading && data?.length === 0 && <div className="px-3 py-4 text-sm text-slate-500">No encontramos productos con esa búsqueda.</div>}
              {searchMode === "quote" && (isSearchingQuotes || isLoadingQuote) && <div className="px-3 py-4 text-sm text-slate-500">Buscando cotizaciones…</div>}
              {searchMode === "quote" && !isSearchingQuotes && quoteSearchData?.data?.map((quote: any) => <button type="button" key={quote.ID_Sale} disabled={quote.expired || isLoadingQuote} onClick={() => handleLoadQuote(Number(quote.ID_Sale))} className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left hover:bg-[#007782]/5 disabled:opacity-45"><span><span className="block font-bold text-slate-900">Cotización {formatFolio(quote.ID_Sale)}</span><span className="block text-xs text-slate-500">{quote.user?.Name || "Público general"}{quote.expired ? " · Vencida" : ""}</span></span><strong className="text-[#007782]">${Number(quote.Total).toFixed(2)}</strong></button>)}
              {searchMode === "quote" && !isSearchingQuotes && quoteSearchData?.data?.length === 0 && <div className="px-3 py-4 text-sm text-slate-500">No encontramos cotizaciones activas.</div>}
            </div>
          )}
        </div>

        <div translate="no" className="notranslate mb-5 overflow-x-auto rounded-2xl border border-slate-200 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">Productos de la venta</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{`${itemCount} artículos`}</span></div>

          {/* Vista tabla en pantallas medianas y grandes */}
          <table className="hidden sm:table w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left">
                  <input
                    type="checkbox"
                    disabled={Boolean(loadedQuote)}
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
                      disabled={Boolean(loadedQuote)}
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
                      disabled={Boolean(loadedQuote)}
                      min={1}
                      max={p.maxAmount || 999}
                      value={p.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === p.id
                              ? { ...item, quantity: newQuantity }
                              : item
                          )
                        );
                      }}
                      className="w-16 text-center border rounded px-1 py-0.5"
                      required
                    />
                  </td>
                  <td className="text-center">${p.price}</td>
                  <td className="text-center">${lineTotal(p).toFixed(2)}</td>
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
                      disabled={Boolean(loadedQuote)}
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

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Cantidad:</span>
                  <input
                    type="number"
                    disabled={Boolean(loadedQuote)}
                    min={1}
                    max={p.maxAmount || 999}
                    value={p.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value);
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id
                            ? { ...item, quantity: newQuantity }
                            : item
                        )
                      );
                    }}
                    className="w-20 text-center border rounded px-1 py-0.5"
                    required
                  />
                </div>

                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold text-[#007782]">
                    ${lineTotal(p).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div translate="no" className="notranslate mb-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="w-full text-sm text-slate-600">
            <p className="flex justify-between gap-8"><span>Subtotal</span><span>{`$${subtotal.toFixed(2)}`}</span></p>
            <p className="flex justify-between gap-8"><span>IVA</span><span>{`$${iva.toFixed(2)}`}</span></p>
            <p className="mt-2 flex justify-between gap-8 border-t border-slate-200 pt-2 text-lg font-bold text-slate-900"><span>Total</span><span>{`$${total.toFixed(2)}`}</span></p>
          </div>
          <button onClick={handleCreateCustomer} disabled={Boolean(loadedQuote?.customerId)} className="rounded-xl border border-[#007782]/30 bg-white px-4 py-2.5 font-semibold text-[#007782] hover:bg-[#007782]/5 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white">
            {customerData ? "Cambiar cliente" : "Agregar cliente"}
          </button>
        </div>

        {customerData && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-[#007782]/20 bg-[#007782]/5 p-4">
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-[#007782]">Cliente asignado</p><p className="truncate font-bold text-slate-900">{customerData.Name}</p><p className="truncate text-sm text-slate-600">{customerData.Email}</p>{customerData.Phone && <p className="text-sm text-slate-500">{customerData.Phone}</p>}</div>
            {!loadedQuote?.customerId && <button type="button" onClick={() => setCustomerData(null)} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Quitar</button>}
          </div>
        )}

        <div className="mb-5"><p className="mb-2 text-sm font-semibold text-slate-700">Tipo de venta</p><div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setSaleMode("cash")} className={`rounded-lg px-3 py-2.5 font-semibold ${saleMode === "cash" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}>Pago inmediato</button><button type="button" onClick={() => { setSaleMode("credit"); setSelectedPayment([]); setPaymentMethod(""); setAmount(""); }} className={`rounded-lg px-3 py-2.5 font-semibold ${saleMode === "credit" ? "bg-white text-[#c70063] shadow-sm" : "text-slate-500"}`}>Venta a crédito</button></div></div>
        {saleMode === "credit" && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">El cliente pagará después</p><p>El total quedará como saldo pendiente y aparecerá en Ventas para registrar abonos. Es obligatorio asignar un cliente.</p></div>}

        <div className="flex flex-col md:flex-wrap md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {saleMode === "cash" && <div className="text-sm w-full md:flex-1 md:min-w-[200px]">
            <select
              id="tipoPago"
              name="tipoPago"
              className="border rounded px-3 py-2 w-full"
              value={selectedState}
              onChange={(e) => setSelectedState(Number(e.target.value))}
            >
              <option value="" disabled>Selecciona un estado</option>
              {isLoading && <option>Cargando...</option>}
              {states?.map((state: any) => (
                <option key={state.ID_State} value={state.ID_State}>
                  {state.Description}
                </option>
              ))}
            </select>
          </div>}

          {saleMode === "cash" && <div className="text-sm w-full md:flex-1 md:min-w-[200px]">
            <select
              id="metodoPago"
              name="metodoPago"
              className="border rounded px-3 py-2 w-full"
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setAmount(remaining > 0 ? remaining.toFixed(2) : ""); }}
            >
              <option value="">Selecciona un método de pago</option>
              {availablePaymentMethods.map((payment: PaymentSale) => (
                <option key={payment.ID_Payment} value={payment.ID_Payment}>
                  {payment.Description}
                </option>
              ))}
            </select>
          </div>}
        </div>

        {saleMode === "cash" && paymentMethod && (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
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
                min="0.01"
                step="0.01"
                className="w-full max-w-full border rounded px-3 py-2"
                required
              />
            </div>
            {isCashPayment && tenderedAmount > 0 && <div className="col-span-full rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><span className="font-semibold">Cambio a entregar:</span> {change.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</div>}

            <div className="w-full">
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
                className="w-full max-w-full border rounded px-3 py-2"
              />
            </div>

            <div className="col-span-full">
              <button
                type="button"
                onClick={handleAddPayment}
                disabled={!amount}
                className="w-full rounded-xl bg-[#007782] px-4 py-2.5 font-semibold text-white hover:bg-[#00636c] disabled:opacity-40 sm:w-auto"
              >
                Agregar pago
              </button>
            </div>
          </div>
        )}

        {saleMode === "cash" && selectedPayment.length > 0 && (
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


        <div className="mt-8 grid w-full gap-2 border-t border-slate-200 pt-5 sm:grid-cols-[auto_auto_1fr]">
          <button
            onClick={handleImpresTicket}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            disabled={!idSale}
          >
            Imprimir ticket
          </button>
          <button
            onClick={handleSendTicket}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            disabled={!idSale}
          >
            Enviar por correo
          </button>
          <button
            onClick={handleSaveSale}
            disabled={!paymentCovered}
            className="w-full rounded-xl bg-[#c70063] px-5 py-3 font-bold text-white hover:bg-[#a90054] disabled:cursor-not-allowed disabled:opacity-40 sm:ml-auto"
          >
            {saleMode === "credit" ? (customerData ? "Registrar venta a crédito" : "Selecciona un cliente") : paymentCovered ? "Confirmar cobro y venta" : `Falta cobrar $${remaining.toFixed(2)}`}
          </button>
        </div>
        </>
        )}

        {activeTab === "retiro" && (
          <div className="border rounded p-4 mb-4 bg-white shadow">
            <h3 className="font-semibold text-lg mb-4">Retiro de dinero</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="monto">
                Monto a retirar
              </label>
              <input
                type="number"
                name="Amount"
                value={dataRetiro.Amount}
                onChange={(e) =>
                  setdataRetiro({ ...dataRetiro, Amount: e.target.value })
                }
                placeholder="Ingrese el monto..."
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Lote</label>
              <input
                type="text"
                name="Batch"
                value={`Lote: #${dataRetiro.Batch}`}
                disabled
                className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="descripcion">
                Motivo del retiro
              </label>
              <textarea
                name="Description"
                value={dataRetiro.Description}
                onChange={(e) =>
                  setdataRetiro({ ...dataRetiro, Description: e.target.value })
                }
                placeholder="Motivo del retiro..."
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="tipoPago">
                Tipo de retiro
              </label>
              <select
                id="Payment"
                name="Payment"
                className="w-full border rounded px-3 py-2 text-sm"
                value={dataRetiro.Payment}
                onChange={(e) =>
                  setdataRetiro({ ...dataRetiro, Payment: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Selecciona un método de pago
                </option>
                {availablePaymentMethods.map((payment: PaymentSale) => (
                  <option key={payment.ID_Payment} value={payment.ID_Payment}>
                    {payment.Description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleSaveRetiro}
                className={`${styles.buttonAgregarCliente} ${
                  !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!isFormValid}
              >
                Confirmar retiro
              </button>
              <button
                className={`${styles.buttonfacturar} ${
                  idRetiro === null ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={idRetiro === null}
              >
                Imprimir ticket
              </button>
            </div>
          </div>
        )}


        {modalOpen && (
          <ModalCustomers onClose={() => setModalOpen(false)} onSave={handleSaveCustomer} />
        )}
      </div>
    );
  };


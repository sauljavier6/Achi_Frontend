import { useEffect, useRef, useState } from "react";
import ModalCustomers from "../../../sales/customers/modalcustomers/ModalCustomers";
import { postCustomerSale, searchProducts } from "../../../../api/Post/SaleApi/SaleApi";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient  } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { openTicket, sendCotizacion } from "../../../../api/Post/TicketApi/TicketApi";
import { getQuoteById, postQuote, updateQuote } from "../../../../api/Post/QuotesApi/QuotesApi";
import { getAuthUser } from "../../../../utils/auth";
import { lineTotal, numericValue, taxRate, useSaleProducts } from "../../../../utils/saleSummary";

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

interface SaleData {
  ID_User: number;
  Total: number;
  Balance_Total: number;
  Subtotal: number;
  Iva: number;
  ID_State: number;
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
    const [products, setProducts, saleSummary] = useSaleProducts<SaleProduct>();
    const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
    const [idSale, setIdSale] = useState<number | null>(null);
    const [selectedProductsDelete, setSelectedProductsDelete] = useState<number[]>([]);
    const allSelected = products.length > 0 && products.every((p) => selectedProductsDelete.includes(p.id));
    const [modalOpen, setModalOpen] = useState(false);
    const saveLockRef = useRef(false);

    const { itemCount, subtotal, iva, total } = saleSummary;

    const usuario = getAuthUser();
    const idusuario = usuario?.ID_User;

    useEffect(() => {
      if (ID_Sale) {
        const fetchSale = async () => {
          try {
            const datasale = await getQuoteById(ID_Sale);
            const data = datasale.data;
            setCustomerData(data?.user ?? null);
            setIdSale(data.ID_Sale);

            //estado para los productos
            const mappedProducts: SaleProduct[] = data.SaleProduct.map((item: any) => ({
              id: item.Stock?.ID_Stock,
              maxAmount: Number(item.Stock?.Amount ?? 0),
              productId: item.ID_Product,
              name: item.Product.Description + ' - ' + item.Stock.Description,
              quantity: numericValue(item.Quantity),
              price: numericValue(item.Saleprice),
              iva: taxRate(item.Product?.Iva?.Iva),
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

    const queryClient = useQueryClient();

    const { mutate: createQuote, isPending: isCreating } = useMutation({
      mutationFn: postQuote,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: (data) => {
          setIdSale(data.data.ID_Sale)
          setProducts((current) => current.map((product) => {
            const saved = data.data.items?.find((item: any) => Number(item.ID_Stock) === product.id);
            return saved ? { ...product, price: Number(saved.Saleprice) } : product;
          }));
          toast.success("Cotización creada correctamente", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['quotes'] });
      },
      onSettled: () => { saveLockRef.current = false; },
    });

    const { mutate: editQuote, isPending: isUpdating } = useMutation({
      mutationFn: updateQuote,
      onError: (error) => {
          toast.error(`${error.message}`, {
          position: "top-right",
          });
      },
      onSuccess: (data) => {
          setIdSale(data.data.ID_Sale)
          setProducts((current) => current.map((product) => {
            const saved = data.data.items?.find((item: any) => Number(item.ID_Stock) === product.id);
            return saved ? { ...product, price: Number(saved.Saleprice) } : product;
          }));
          toast.success("Cotización actualizada correctamente", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['quotes'] });
      },
      onSettled: () => { saveLockRef.current = false; },
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
          toast.success("Cliente creado y asignado a la cotización", {
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
          toast.success("Cotización enviada por correo correctamente", {
          position: "top-right",
          progressClassName: "custom-progress",
          });
          queryClient.invalidateQueries({ queryKey: ['sendticket'] });
      },
    });

    const handleSaveSale = () => {
      if (saveLockRef.current || isCreating || isUpdating) return;
      if (!idusuario) {
        toast.error("No se pudo identificar al operador. Inicia sesión nuevamente.");
        return;
      }
      if (products.length === 0) {
        toast.error("Agrega al menos un producto a la cotización.");
        return;
      }
      if (products.some((product) => !Number.isInteger(product.quantity) || product.quantity < 1 || product.quantity > product.maxAmount)) {
        toast.error("Revisa las cantidades: deben ser enteras y no superar el stock disponible.");
        return;
      }

      const saleData: SaleData = {
        ...(ID_Sale ? { ID_Sale } : {}),
        ID_User: customerData?.ID_User ?? 0,
        Total: total,
        Balance_Total: total,
        Subtotal: subtotal,
        Iva: iva,
        ID_State: 1,
        ID_Operador: Number(idusuario),
        Lote: '',
        items: products.map(p => ({
          productId: p.productId,
          stockId: p.id,
          quantity: p.quantity,
          price: p.price,
          subtotal: p.price * p.quantity,
        })),
      };

      // El ref bloquea de forma síncrona incluso dos clics ocurridos antes
      // de que React alcance a renderizar el estado isPending.
      saveLockRef.current = true;

      if (ID_Sale) {
        // Modo edición
        console.log('dentro de edicion')
        editQuote(saleData);
      } else {
        createQuote(saleData);
      }
    };

    const hasValidProducts = products.length > 0 && products.every(
      (product) => Number.isInteger(product.quantity) && product.quantity >= 1 && product.quantity <= product.maxAmount,
    );
    const canSaveQuote = Boolean(idusuario) && hasValidProducts && !isCreating && !isUpdating;

    const handleCreateCustomer = () => {
      setModalOpen(true);
    };

    const handleSaveCustomer = (data: CustomerFormData) => {
      setIdSale(null);
      if (data.ID_User != null) {
        setCustomerData(data);
      } else {
        customerCreateMutate(data);
      }
    };

    const handleImpresTicket = async () => {
      try {
        if (idSale) await openTicket(idSale, true);
      } catch (error) {
        console.error("Error al imprimir el ticket:", error);
      }
    };

    const handleSendTicket = () => {
      if (idSale !== null) {
        sendTiket(idSale);
      }
    };

    return (
      <div className="w-full min-w-0">
        <div className="mb-6"><p className="text-sm font-semibold text-[#c70063]">Ventas</p><h2 className="text-xl font-bold text-slate-900">{ID_Sale ? "Editar cotización" : "Nueva cotización"}</h2><p className="text-sm text-slate-500">Agrega productos, cliente y condiciones de la propuesta.</p></div>
        <div className="relative mb-5 rounded-2xl border border-slate-200 p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#c70063]">Paso 1 · Productos</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="min-h-11 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-[#c70063] focus:ring-4 focus:ring-[#c70063]/10"
            />
            <button
              onClick={() => {
                setIdSale(null);
                setProducts((prev) =>
                  prev.filter((p) => !selectedProductsDelete.includes(p.id))
                );
                setSelectedProductsDelete([]);
              }}
              disabled={selectedProductsDelete.length === 0}
              className="rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
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
                              price: numericValue(variant.Saleprice),
                              maxAmount: variant.Amount,
                              stockVariant: variant.Description,
                              iva: taxRate(product.Iva?.Iva),
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

        <div translate="no" className="notranslate mb-5 overflow-x-auto rounded-2xl border border-slate-200 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Productos cotizados</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{`${itemCount} artículos`}</span></div>

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
                        setIdSale(null);
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === p.id ? { ...item, quantity: Number.isNaN(newQuantity) ? 0 : Math.min(newQuantity, item.maxAmount) } : item
                          )
                        );
                      }}
                      className="w-16 text-center border rounded px-1 py-0.5"
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
                      setIdSale(null);
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id ? { ...item, quantity: Number.isNaN(newQuantity) ? 0 : Math.min(newQuantity, item.maxAmount) } : item
                        )
                      );
                    }}
                    className="w-20 text-center border rounded px-1 py-0.5"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="text-green-600 font-semibold">
                    ${lineTotal(p).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div translate="no" className="notranslate mb-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="w-full text-sm text-slate-600">
            <p className="flex justify-between gap-8"><span>Subtotal</span><span>{`$${subtotal.toFixed(2)}`}</span></p><p className="flex justify-between gap-8"><span>IVA</span><span>{`$${iva.toFixed(2)}`}</span></p><p className="mt-2 flex justify-between gap-8 border-t border-slate-200 pt-2 text-xl font-black text-slate-900"><span>Total</span><span>{`$${total.toFixed(2)}`}</span></p>
          </div>
          <button onClick={handleCreateCustomer} className="rounded-xl border border-[#007782]/30 bg-white px-4 py-2.5 font-semibold text-[#007782] hover:bg-[#007782]/5">
            {customerData ? "Cambiar cliente" : "Asignar cliente"}
          </button>
        </div>

        {customerData && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-[#007782]/20 bg-[#007782]/5 p-4">
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-[#007782]">Cliente asignado</p><p className="truncate font-bold text-slate-900">{customerData.Name}</p><p className="truncate text-sm text-slate-600">{customerData.Email}</p></div>
            <button type="button" onClick={() => { setCustomerData(null); setIdSale(null); }} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Quitar</button>
          </div>
        )}

        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          La cotización no reserva inventario ni registra pagos. Las existencias se validan nuevamente al convertirla en venta.
        </div>

        <div className="mt-6 grid w-full gap-2 border-t border-slate-200 pt-5 sm:grid-cols-[auto_auto_1fr]">
          <button
            onClick={handleImpresTicket}
            className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            disabled={!idSale}
          >
            Imprimir Ticket
          </button>
          <button
            onClick={handleSendTicket}
            className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            disabled={!idSale}
          >
            Enviar por correo
          </button>
          <button disabled={!canSaveQuote} onClick={handleSaveSale} className="rounded-xl bg-[#c70063] px-5 py-3 font-bold text-white hover:bg-[#a90054] disabled:cursor-not-allowed disabled:opacity-60">
            {isCreating || isUpdating ? "Guardando…" : ID_Sale ? "Actualizar cotización" : "Guardar cotización"}
          </button>
        </div>

        {modalOpen && (
          <ModalCustomers onClose={() => setModalOpen(false)} onSave={handleSaveCustomer} onEdit={customerData?.ID_User}/>
        )}
      </div>
    );
  };


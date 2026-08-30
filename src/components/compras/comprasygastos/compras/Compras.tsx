import { useEffect, useState } from "react";
import { searchProducts } from "../../../../api/Post/SaleApi/SaleApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPayments } from "../../../../api/Post/PaymentApi/PaymentApi";
import ModalSuppliers, { type Suppliers } from "../../suppliers/modalsuppliers/ModalSuppliers";
import { toast } from "react-toastify";
import { postCompra } from "../../../../api/Post/ComprasApi/ComprasApi";
import { getAuthUser } from "../../../../utils/auth";

interface Product {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  saleprice: number;
  purchaseprice: number;
  amount?: number;
  variant?: string;
  iva: number;
}

interface Payment {
  ID_Payment: number;
  Description: string;
  Monto: number;
  ReferenceNumber: string;
}

  export default function Compras({ onBack }: { onBack?: () => void }) {
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState(search);
    const [products, setProducts] = useState<Product[]>([]);
    const [idSupplier, setUIdSupplier] = useState<number | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Suppliers | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<Payment[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");


    const [selectedProductsDelete, setSelectedProductsDelete] = useState<number[]>([]);
    const allSelected = products.length > 0 && products.every((p) => selectedProductsDelete.includes(p.id));
    const [modalOpen, setModalOpen] = useState(false);

    const grossTotal = products.reduce((sum, p) => sum + p.purchaseprice * p.quantity, 0);
    const subtotal = products.reduce((sum, p) => {
      const gross = p.purchaseprice * p.quantity;
      const rate = Number(p.iva) > 1 ? Number(p.iva) / 100 : Number(p.iva || 0);
      return sum + (rate > 0 ? gross / (1 + rate) : gross);
    }, 0);
    const iva = grossTotal - subtotal;
    const total = grossTotal;
    const paidTotal = selectedPayment.reduce((sum, payment) => sum + Number(payment.Monto), 0);
    const remaining = Math.max(0, total - paidTotal);

    const usuario = getAuthUser();
    const idusuario = usuario?.ID_User;

    useEffect(() => {
      const timeout = setTimeout(() => setDebounced(search), 300);
      return () => clearTimeout(timeout);
    }, [search]);

    const { data, isLoading } = useQuery({
      // La caja y compras comparten el buscador, pero no la misma política de
      // inventario. Separar la caché evita reutilizar en Compras el resultado
      // filtrado de Caja (que excluye existencias en cero).
      queryKey: ['search', 'purchases', 'include-out-of-stock', debounced],
      queryFn: () => searchProducts(debounced || '', true),
      enabled: debounced.length > 0,
    });

    const { data: paymentsData } = useQuery({
      queryKey: ['payments'],
      queryFn: getPayments,
    });

    const selectedPaymentMethod = paymentsData?.data?.find(
      (payment: Payment) => payment.ID_Payment === Number(paymentMethod)
    );
    const isCreditPurchase = selectedPaymentMethod?.Description
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase() === "credito";

    useEffect(() => {
      if (selectedPayment.length === 0) setAmount(total > 0 ? total.toFixed(2) : "");
    }, [total, selectedPayment.length]);

    const queryClient = useQueryClient();

    const { mutate: createSupplier } = useMutation({
      mutationFn: postCompra,
      onError: (error) => {
        toast.error(`${error.message}`, {
        position: "top-right",
        });
        },
      onSuccess: () => {
        setProducts([]);
        setUIdSupplier(null);
        setSelectedSupplier(null);
        setSelectedPayment([])
        setPaymentMethod("");
        setAmount("");
        setReference("");
        toast.success("Compra registrada e inventario actualizado", {
        position: "top-right",
        progressClassName: "custom-progress",
        });
        queryClient.invalidateQueries({ queryKey: ['compras'] });
      },
    });

    const handleSaveSale = async () => {
      if (!idSupplier) {
        toast.warn("Selecciona o registra un proveedor para completar la compra");
        return;
      }
      if (!isCreditPurchase && remaining > 0.009) {
        toast.warn("Registra el pago completo o selecciona compra a crédito");
        return;
      }
      const compradata = {
        ID_Proveedor: idSupplier!,
        Total: total, 
        Balance_Total: total, 
        Iva: iva,
        Subtotal: subtotal,
        ID_Operador: idusuario!,
        items: products,
        Payments: selectedPayment
      }

      createSupplier(compradata)
    };

    const handleCreateCustomer = () => {
      setModalOpen(true);
    };

    const handleAddPayment = () => {
      if (!paymentMethod || !amount) return;

      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) return toast.warn("Ingresa un monto de pago válido");
      if (numericAmount > remaining + 0.009) return toast.warn("El pago no puede superar el saldo de la compra");

      const selectedPaymentData = paymentsData.data.find(
        (p: Payment) => p.ID_Payment === Number(paymentMethod)
      );

      setSelectedPayment((prev) => [
        ...prev,
        {
          ID_Payment: Number(paymentMethod),
          Description: selectedPaymentData?.Description || "",
          Monto: numericAmount,
          ReferenceNumber: reference || "",
        },
      ]);

      // Cerrar la captura después de agregar, igual que en Caja. El selector
      // queda disponible para registrar otro pago solo si hace falta saldo.
      setPaymentMethod("");
      setAmount("");
      setReference("");
    };

    const handleDeletePayment = (index: number) => {
      setSelectedPayment((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveSupplier = (data: Suppliers) => {
      if (data.ID_User) {
       setUIdSupplier(data.ID_User);
       setSelectedSupplier(data);
      }
    };

    return (
      <div className="w-full min-w-0">
        <div className="relative mb-5">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Operación de compra</p>
              <p className="text-xs text-slate-500">Recibe mercancía, actualiza costos y registra el pago al proveedor.</p>
            </div>
            {onBack && (
              <button type="button" onClick={onBack} className="self-start rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:self-auto">
                ← Volver a compras
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-4 outline-none focus:border-[#c70063] focus:ring-4 focus:ring-[#c70063]/10"
            />
            <button
              onClick={() => {
                setProducts((prev) =>
                  prev.filter((p) => !selectedProductsDelete.includes(p.id))
                );
                setSelectedProductsDelete([]);
              }}
              disabled={selectedProductsDelete.length === 0}
              className="rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Quitar
            </button>
          </div>

          {search.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
              {isLoading && <div className="px-3 py-4 text-sm text-slate-500">Buscando productos…</div>}
              {!isLoading && data?.map((product:any) => (
                <div key={product.ID_Product} className="border-b border-slate-100 py-1 last:border-0">
                  <div className="px-3 py-2"><p className="font-bold text-slate-900">{product.Description}</p>{product.Code && <p className="text-xs text-slate-500">Código: {product.Code}</p>}</div>
                  <div className="space-y-1">
                  {product.Stock?.map((variant:any) => (
                  <button
                    type="button"
                    key={variant.ID_Stock}
                    onClick={() => {
                      setProducts((prev) => {
                        const exists = prev.find(p => p.id === variant.ID_Stock);
                        if (exists) {
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
                              saleprice: variant.Saleprice,
                              purchaseprice: variant.Purchaseprice,
                              amount: variant.Amount,
                              variant: variant.Description,
                              iva: product.Iva.Iva,
                            }
                          ];
                        }
                      });
                      setSearch('');
                    }}

                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#c70063]/5"
                  >
                    <span><span className="block font-semibold text-slate-800">{variant.Description || "Presentación general"}</span><span className="text-xs text-slate-500">Existencia actual: {variant.Amount}</span></span>
                    <span className="text-right"><span className="block text-xs text-slate-500">Último costo</span><strong className="text-[#c70063]">${Number(variant.Purchaseprice || 0).toFixed(2)}</strong></span>
                  </button>
                ))}
                  </div>
                </div>
              ))}
              {!isLoading && data?.length === 0 && <div className="px-3 py-4 text-sm text-slate-500">No encontramos productos con esa búsqueda.</div>}
            </div>
          )}
        </div>

        <div translate="no" className="notranslate mb-5 overflow-x-auto rounded-2xl border border-slate-200 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Productos en compra</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{products.length} {products.length === 1 ? "producto" : "productos"}</span></div>

          {/* Vista tabla en pantallas medianas y grandes */}
          <table className="hidden w-full text-sm sm:table">
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
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2">Cantidad recibida</th>
                <th className="px-3 py-2">Precio venta</th>
                <th className="px-3 py-2">Costo unitario</th>
                <th className="px-3 py-2">Importe</th>
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
                  <td className="px-3 py-4 font-medium text-slate-800">{p.name}</td>
                  <td className="text-center">
                    <input
                      type="number"
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
                      min="1"
                      step="1"
                      className="min-h-11 w-24 rounded-xl border border-slate-300 px-3 text-right"
                      required
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="number"
                      step="0.01"
                      value={p.saleprice}
                      onChange={(e) => {
                        const newSaleprice = parseFloat(e.target.value) || 0;
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === p.id
                              ? { ...item, saleprice: newSaleprice }
                              : item
                          )
                        );
                      }}
                      min="0"
                      className="min-h-11 w-28 rounded-xl border border-slate-300 px-3 text-right"
                      required
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="number"
                      step="0.01"
                      value={p.purchaseprice}
                      onChange={(e) => {
                        const newPurchaseprice = parseFloat(e.target.value) || 0;
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === p.id
                              ? { ...item, purchaseprice: newPurchaseprice }
                              : item
                          )
                        );
                      }}
                      min="0"
                      className="min-h-11 w-28 rounded-xl border border-slate-300 px-3 text-right"
                      required
                    />
                  </td>
                  <td className="px-3 text-right font-semibold text-slate-900">
                    ${(p.purchaseprice * p.quantity).toFixed(2)}
                  </td>
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
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Stock comprado:</span>
                  <input
                    type="number"
                    value={p.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value);
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id ? { ...item, quantity: newQuantity } : item
                        )
                      );
                    }}
                    min="1"
                    step="1"
                    className="min-h-11 w-28 rounded-xl border border-slate-300 px-3 text-right"
                  />
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Precio venta:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={p.saleprice}
                    onChange={(e) => {
                      const newSaleprice = parseFloat(e.target.value) || 0;
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id
                            ? { ...item, saleprice: newSaleprice }
                            : item
                        )
                      );
                    }}
                    min="0"
                    className="min-h-11 w-28 rounded-xl border border-slate-300 px-3 text-right"
                  />
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Precio compra:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={p.purchaseprice}
                    onChange={(e) => {
                      const newPurchaseprice = parseFloat(e.target.value) || 0;
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id
                            ? { ...item, purchaseprice: newPurchaseprice }
                            : item
                        )
                      );
                    }}
                    min="0"
                    className="min-h-11 w-28 rounded-xl border border-slate-300 px-3 text-right"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="text-green-600 font-semibold">
                    ${(p.purchaseprice * p.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="w-full text-sm text-slate-600">
            <div className="flex items-center justify-between gap-6"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex items-center justify-between gap-6"><span>IVA incluido</span><span>${iva.toFixed(2)}</span></div>
            <div className="mt-2 flex items-center justify-between gap-6 border-t border-slate-200 pt-2 text-slate-900">
              <strong className="text-base">Total</strong><strong className="text-lg">${total.toFixed(2)}</strong>
            </div>
          </div>
          <button onClick={handleCreateCustomer} className="w-full rounded-xl border border-[#007782]/35 bg-white px-5 py-3 font-bold text-[#007782] hover:bg-[#007782]/5 sm:w-auto">
            {selectedSupplier ? "Cambiar proveedor" : "+ Agregar proveedor"}
          </button>
        </div>

        {selectedSupplier && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#007782]/25 bg-[#007782]/5 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[#007782]">Proveedor asignado</p>
              <p className="mt-1 font-bold text-slate-900">{selectedSupplier.Name}</p>
              <p className="break-all text-sm text-slate-600">{selectedSupplier.Email}</p>
              <p className="text-sm text-slate-600">{selectedSupplier.Phone}</p>
              {selectedSupplier.Rfc && <p className="mt-1 text-xs text-slate-500">RFC: {selectedSupplier.Rfc}</p>}
            </div>
            <button type="button" onClick={() => { setUIdSupplier(null); setSelectedSupplier(null); }} className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Quitar</button>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="metodoPago" className="mb-2 block text-sm font-semibold text-slate-700">Forma de pago</label>
            <select
              id="metodoPago"
              name="metodoPago"
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none focus:border-[#007782] focus:ring-2 focus:ring-[#007782]/10"
              value={paymentMethod}
              onChange={(e) => {
                const nextMethod = e.target.value;
                const method = paymentsData?.data?.find((payment: Payment) => payment.ID_Payment === Number(nextMethod));
                const isCredit = method?.Description?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() === "credito";
                setPaymentMethod(nextMethod);
                if (isCredit) {
                  setSelectedPayment([]);
                  setAmount("");
                  setReference("");
                } else {
                  setAmount(remaining.toFixed(2));
                }
              }}
              disabled={products.length === 0 || remaining <= 0.009}
            >
              <option value="">Selecciona un método de pago</option>
              {paymentsData?.data?.map((payment: any) => (
                <option key={payment.ID_Payment} value={payment.ID_Payment}>
                  {payment.Description}
                </option>
              ))}
            </select>
        </div>

        {isCreditPurchase && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">La compra quedará pendiente de pago</p>
            <p>No se registra un pago ahora. El total se guardará como saldo pendiente con este proveedor.</p>
          </div>
        )}

        {paymentMethod && !isCreditPurchase && (
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
                placeholder="0.00"
                min="0.01"
                max={remaining}
                step="0.01"
                className="min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-3 py-2 focus:border-[#007782] focus:outline-none focus:ring-2 focus:ring-[#007782]/15"
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
                className="min-h-11 w-full min-w-0 rounded-xl border border-slate-300 px-3 py-2 focus:border-[#007782] focus:outline-none focus:ring-2 focus:ring-[#007782]/15"
              />
            </div>

            <div className="col-span-full">
              <button
                type="button"
                onClick={handleAddPayment}
                className="mt-2 rounded-xl bg-[#007782] px-4 py-2.5 font-semibold text-white hover:bg-[#00636c]"
              >
                Agregar pago
              </button>
            </div>
          </div>
        )}

        {selectedPayment.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Pagos agregados:</h3>

          {/* Encabezados: ocultar en móviles y mostrar solo en pantallas md+ */}
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
                className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 bg-gray-50 p-2 rounded border text-sm items-center"
              >
                {/* En móviles se muestran con etiqueta */}
                <div className="md:hidden">
                  <span className="font-semibold">Método: </span>{p.Description}
                </div>
                <div className="hidden md:block">{p.Description}</div>

                <div className="md:hidden">
                  <span className="font-semibold">Monto: </span>${p.Monto.toFixed(2)}
                </div>
                <div className="hidden md:block">${p.Monto.toFixed(2)}</div>

                <div className="md:hidden">
                  <span className="font-semibold">Referencia: </span>{p.ReferenceNumber || "—"}
                </div>
                <div className="hidden md:block">{p.ReferenceNumber || "—"}</div>

                <div>
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

        {products.length > 0 && <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-600">{isCreditPurchase ? "Saldo a crédito" : "Saldo pendiente"}</span><strong>${remaining.toFixed(2)}</strong></div>}

        <div className="mt-8 border-t border-slate-200 pt-5">
        <button
          onClick={handleSaveSale}
          disabled={products.length === 0 || !idSupplier || (!isCreditPurchase && remaining > 0.009)}
          className="w-full rounded-xl bg-[#c70063] px-5 py-3 font-bold text-white hover:bg-[#a90054] disabled:cursor-not-allowed disabled:bg-[#e18ab5]"
        >
          {products.length === 0 ? "Registrar compra" : !idSupplier ? "Selecciona un proveedor" : isCreditPurchase ? "Registrar compra a crédito" : remaining > 0.009 ? `Falta registrar $${remaining.toFixed(2)}` : "Registrar compra"}
        </button>
        </div>

        {modalOpen && (
          <ModalSuppliers onClose={() => setModalOpen(false)} onSave={handleSaveSupplier}/>
        )}
      </div>
    );
  };

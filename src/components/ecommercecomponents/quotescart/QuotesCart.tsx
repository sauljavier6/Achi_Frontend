import { useState } from "react";
import { useCart } from "../../../context/CartContext";
import { postQuote } from "../../../api/Ecommerce/QuotesApi";

export default function QuotesCart() {
  const [user, setUser] = useState({
    email: "",
    name: "",
    phone: "",
  });
  
  const { state, removeItem, increaseQty, decreaseQty, clearCart,  getSubTotal, getIva, getTotal } = useCart();

  const handleQuote = async () => {
    try {
      const saleData = {
        User: user,
        Total: getTotal(),
        Subtotal: getSubTotal(),
        Iva: getIva(),
        items: state.items.map((item) => ({
          productId: item.ID_Product,
          stockId: item.ID_Stock,
          quantity: item.Quantity,
          price: item.Saleprice,
          subtotal: item.Quantity * item.Saleprice,
        })),
      };

      const response = await postQuote(saleData);
      alert("✅ Cotización generada con éxito");
      console.log("Respuesta del servidor:", response);
      clearCart();
    } catch (error) {
      console.error(error);
      alert(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-4 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Cotización de Productos
        </h2>

        {state.items.length === 0 ? (
          <p className="text-gray-500 text-center">No hay productos en tu cotización.</p>
        ) : (
          <>
            {/* 🖥️ Tabla para pantallas medianas y grandes */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Producto</th>
                    <th className="text-center py-3 px-4 text-gray-600 font-semibold">Cantidad</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">Precio U.</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((item) => (
                    <tr key={item.ID_Product} className="border-t hover:bg-gray-50">
                      <td className="flex items-center gap-3 py-3 px-4">
                        {item.Imagen ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL_IMAGES}${item.Imagen}`}
                            alt={item.Description}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md border">
                            N/A
                          </div>
                        )}
                        <span className="font-medium text-gray-800">{item.Description}</span>
                      </td>

                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              decreaseQty({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })
                            }
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 rounded"
                          >
                            -
                          </button>
                          <span className="px-2">{item.Quantity}</span>
                          <button
                            onClick={() =>
                              increaseQty({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })
                            }
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 rounded"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="text-right px-4">${item.Saleprice}</td>
                      <td className="text-right px-4">
                        ${(item.Quantity * item.Saleprice).toFixed(2)}
                      </td>
                      <td className="text-center px-4">
                        <button
                          onClick={() =>
                            removeItem({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })
                          }
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📱 Vista tipo "cards" para móviles */}
            <div className="sm:hidden space-y-4">
              {state.items.map((item) => (
                <div
                  key={item.ID_Product}
                  className="border rounded-lg p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex gap-3">
                    {item.Imagen ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL_IMAGES}${item.Imagen}`}
                        alt={item.Description}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-md border">
                        N/A
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{item.Description}</h3>
                      <p className="text-gray-600 text-sm">
                        ${item.Saleprice} c/u
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        removeItem({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })
                      }
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() =>
                          decreaseQty({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })
                        }
                        className="bg-gray-200 hover:bg-gray-300 px-2 rounded"
                      >
                        -
                      </button>
                      <span>{item.Quantity}</span>
                      <button
                        onClick={() =>
                          increaseQty({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })
                        }
                        className="bg-gray-200 hover:bg-gray-300 px-2 rounded"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ${(item.Quantity * item.Saleprice).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <div className="text-right space-y-2">
                <p className="text-gray-700 text-lg">
                  Subtotal:{" "}
                  <span className="font-semibold">
                    ${getSubTotal().toFixed(2)}
                  </span>
                </p>

                <p className="text-gray-700 text-lg">
                  IVA:{" "}
                  <span className="font-semibold">
                    ${getIva().toFixed(2)}
                  </span>
                </p>

                <p className="text-gray-700 text-lg">
                  Total estimado:{" "}
                  <span className="font-semibold">
                    ${(getSubTotal() + getIva()).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>


            {/* 🖥️ Tabla y formulario responsive */}
            <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <input
                type="email"
                placeholder="Correo"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                type="text"
                placeholder="Nombre"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                type="phone"
                placeholder="Teléfono"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            </div>


            {/* Botones */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={clearCart}
                className="w-full sm:w-auto px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded transition-colors"
              >
                Vaciar cotización
              </button>
              <button
                onClick={handleQuote}
                disabled={!user.email || !user.name}
                className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded transition-colors ${
                  !user.email || !user.name
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Generar Cotización
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useCart } from "../../../context/CartContext";
import { useNavigate } from 'react-router-dom';

export default function ShoppingCart() {
  const { state, removeItem, increaseQty, decreaseQty, clearCart, getSubTotal, getIva, getTotal } = useCart();
  const navigate = useNavigate();


  const handlePagar = () => {
    navigate('/stripe', { state: { amount: getTotal() } });
    alert("Sera redireccionado a la pasarela de pago.");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-star">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-sm p-6 min-h-60">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Carrito</h2>
        {state.items.length === 0 ? (
          <p className="text-gray-500 text-center">Tu carrito está vacío.</p>
        ) : (
          <div className="space-y-4">
            {state.items.map((item) => (
              <div
                key={item.ID_Product}
                className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 border rounded-md hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {item.Imagen ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL_IMAGES}${item.Imagen}`}
                      alt={item.Description}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-md border">
                      Sin imagen
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.Description}</h3>
                    <p className="text-gray-600">
                      ${item.Saleprice} x {item.Quantity}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => decreaseQty({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    >
                      -
                    </button>
                    <span className="px-2">{item.Quantity}</span>
                    <button
                      onClick={() => increaseQty({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem({ ID_Product: item.ID_Product, ID_Stock: item.ID_Stock })}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    ❌ Eliminar
                  </button>
                </div>
              </div>
            ))}


            <div className="border-t mt-4 pt-4 space-y-2 text-gray-800">
              <div className="flex justify-between items-center text-base">
                <span>Subtotal:</span>
                <span>${getSubTotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-base">
                <span>IVA:</span>
                <span>${getIva().toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>


            <button
              onClick={clearCart}
              className="w-full mt-4 bg-gray-400 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded transition-colors"
            >
              Vaciar carrito
            </button>
            <button
              onClick={handlePagar}
              className="w-full mt-4 bg-blue-800 hover:bg-blue-500 text-gray-800 font-semibold py-2 rounded transition-colors"
            >
              Pagar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

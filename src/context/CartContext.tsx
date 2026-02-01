import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";

interface CartItem {
  ID_Product: number;
  Description: string;
  ID_Stock: number;
  StockDescription: string;
  Saleprice: number;
  Quantity: number;
  Iva: number;
  Imagen?: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { ID_Product: number; ID_Stock: number } }
  | { type: "CLEAR_CART" }
  | { type: "INCREASE_QTY"; payload: { ID_Product: number; ID_Stock: number } }
  | { type: "DECREASE_QTY"; payload: { ID_Product: number; ID_Stock: number } }
  | { type: "SET_CART"; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) =>
          item.ID_Product === action.payload.ID_Product &&
          item.ID_Stock === action.payload.ID_Stock
      );

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.ID_Product === action.payload.ID_Product &&
            item.ID_Stock === action.payload.ID_Stock
              ? { ...item, Quantity: item.Quantity + action.payload.Quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(item.ID_Product === action.payload.ID_Product &&
              item.ID_Stock === action.payload.ID_Stock)
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "INCREASE_QTY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.ID_Product === action.payload.ID_Product &&
          item.ID_Stock === action.payload.ID_Stock
            ? { ...item, Quantity: item.Quantity + 1 }
            : item
        ),
      };

    case "DECREASE_QTY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.ID_Product === action.payload.ID_Product &&
          item.ID_Stock === action.payload.ID_Stock && item.Quantity > 1
            ? { ...item, Quantity: item.Quantity - 1 }
            : item
        ),
      };

    case "SET_CART":
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

interface CartContextProps {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (ids: { ID_Product: number; ID_Stock: number }) => void;
  clearCart: () => void;
  increaseQty: (ids: { ID_Product: number; ID_Stock: number }) => void;
  decreaseQty: (ids: { ID_Product: number; ID_Stock: number }) => void;
  getSubTotal: () => number;
  getIva: () => number;
  getTotal: () => number;
  getEnvio: () => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    cartReducer,
    undefined,
    () => ({
      items: (() => {
        try {
          return JSON.parse(localStorage.getItem("cart") || "[]");
        } catch {
          return [];
        }
      })(),
    })
  );

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (ids: { ID_Product: number; ID_Stock: number }) =>
    dispatch({ type: "REMOVE_ITEM", payload: ids });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const increaseQty = (ids: { ID_Product: number; ID_Stock: number }) =>
    dispatch({ type: "INCREASE_QTY", payload: ids });
  const decreaseQty = (ids: { ID_Product: number; ID_Stock: number }) =>
    dispatch({ type: "DECREASE_QTY", payload: ids });

  const getSubTotal = () =>
    state.items.reduce((acc: number, item: { Saleprice: number; Quantity: number; }) => acc + item.Saleprice * item.Quantity, 0);

  // Total del IVA
  const getIva = () => state.items.reduce((acc:number, item: {Saleprice: number; Quantity: number; Iva: number}) => acc + (item.Saleprice * item.Quantity * item.Iva), 0);

  //
  const getEnvio = () => 500; 

  // Total general (subtotal + IVA)
  const getTotal = () => getSubTotal() + getIva() + getEnvio();

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, clearCart, increaseQty, decreaseQty, getSubTotal, getIva, getTotal, getEnvio }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};

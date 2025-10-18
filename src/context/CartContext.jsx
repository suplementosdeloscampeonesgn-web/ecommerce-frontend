// CAMBIO: Se corrigió la importación de React en esta línea
import React, { createContext, useReducer, useContext, useMemo } from 'react';

const CartContext = createContext();

// --- Función Auxiliar para Calcular los Totales ---
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
};

// --- Estado Inicial ---
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// --- Reducer con más funcionalidades ---
function reducer(state, action) {
  let newItems;

  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(i => i.id === action.payload.id);
      if (existingItem) {
        newItems = state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      return { ...state, items: newItems, ...calculateTotals(newItems) };

    case 'REMOVE_ITEM':
      newItems = state.items.filter(i => i.id !== action.payload.id);
      return { ...state, items: newItems, ...calculateTotals(newItems) };

    case 'UPDATE_QUANTITY':
      newItems = state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        ).filter(i => i.quantity > 0); // Elimina el item si la cantidad es 0
      return { ...state, items: newItems, ...calculateTotals(newItems) };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

// --- Provider del Contexto ---
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addItem = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, quantity },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = useMemo(() => ({
    cart: state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }), [state]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// --- Hook Personalizado ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
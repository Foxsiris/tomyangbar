import { createContext, useContext } from 'react';
import { useApiCart } from '../hooks/useApiCart';
import { useSupabaseUser } from './SupabaseUserContext';

const CartContext = createContext();

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useSupabaseUser();
  const cartData = useApiCart(user?.id);

  return (
    <CartContext.Provider value={cartData}>
      {children}
    </CartContext.Provider>
  );
};

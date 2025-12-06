import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart, addToCart as addToCartApi, removeFromCart as removeFromCartApi, updateCartItem, clearCart as clearCartApi, Cart } from '../utils/paymentsApi';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  cartCount: number;
  totalAmount: number;
  refreshCart: () => Promise<void>;
  addItem: (bundleId?: number, paperId?: number, quantity?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = async () => {
    if (!isLoggedIn) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (bundleId?: number, paperId?: number, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await addToCartApi(bundleId, paperId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);
      await removeFromCartApi(itemId);
      await refreshCart();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      await updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCartHandler = async () => {
    try {
      setLoading(true);
      setError(null);
      await clearCartApi();
      setCart(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount and when authentication changes
  useEffect(() => {
    if (isLoggedIn) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isLoggedIn]);

  const cartCount = cart?.total_items || 0;
  const totalAmount = parseFloat(cart?.total_amount || '0');

  const value: CartContextType = {
    cart,
    loading,
    error,
    cartCount,
    totalAmount,
    refreshCart,
    addItem,
    removeItem,
    updateItem,
    clearCart: clearCartHandler,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

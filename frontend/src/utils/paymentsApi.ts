import { fetchWithAuth } from './apiInterceptor';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types
export interface CartItem {
  id: number;
  bundle: number | null;
  paper: number | null;
  bundle_details?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    cover_image: string | null;
    is_paid: boolean;
    price: string;
    category_name: string;
  };
  paper_details?: {
    id: number;
    title: string;
    slug: string;
    category_name: string;
    year: number;
  };
  quantity: number;
  price_at_addition: string;
  subtotal: string;
  item_name: string;
  item_type: 'bundle' | 'paper';
  added_at: string;
}

export interface Cart {
  id: number;
  user: number;
  items: CartItem[];
  total_items: number;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  bundle: number | null;
  paper: number | null;
  bundle_details?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    cover_image: string | null;
    is_paid: boolean;
    price: string;
    category_name: string;
  };
  paper_details?: {
    id: number;
    title: string;
    slug: string;
    category_name: string;
    year: number;
  };
  item_name: string;
  price: string;
  quantity: number;
  subtotal: string;
  total_price: string;
  item_type: 'bundle' | 'paper';
}

export interface OrderItem {
  id: number;
  bundle: number | null;
  paper: number | null;
  bundle_details?: any;
  paper_details?: any;
  item_name: string;
  price: string;
  quantity: number;
  subtotal: string;
  item_type: 'bundle' | 'paper';
}

export interface Order {
  id: number;
  order_number: string;
  payment_method?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  subtotal: string;
  tax: string;
  discount: string;
  total_amount: string;
  currency: string;
  items?: OrderItem[];
  total_items?: number;
  payment?: {
    id: number;
    payment_method: string;
    status: string;
    transaction_id: string | null;
    created_at: string;
    completed_at: string | null;
  };
  notes: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface UserPurchase {
  id: number;
  bundle: number | null;
  paper: number | null;
  bundle_details?: any;
  paper_details?: any;
  order_number: string;
  item_name: string;
  item_type: 'bundle' | 'paper';
  purchase_price: string;
  purchased_at: string;
  expires_at: string | null;
  is_active: boolean;
  has_access: boolean;
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
}

// Cart APIs
export const getCart = async (): Promise<Cart> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/cart/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (bundleId?: number, paperId?: number, quantity: number = 1): Promise<Cart> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/cart/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bundle_id: bundleId,
        paper_id: paperId,
        quantity,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add item to cart');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<CartItem> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/cart/items/${itemId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update cart item');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (itemId: number): Promise<void> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove item from cart');
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/cart/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Order APIs
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/orders/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: number): Promise<Order> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/orders/${orderId}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const createOrder = async (data: {
  payment_method: string;
  notes?: string;
  billing_address?: any;
}): Promise<any> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: number): Promise<void> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/orders/${orderId}/`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Payment APIs
export const confirmPayment = async (data: {
  order_id: number;
  payment_method: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  stripe_payment_intent_id?: string;
}): Promise<any> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/payment/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment confirmation failed');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Purchase APIs
export const getUserPurchases = async (): Promise<UserPurchase[]> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/purchases/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch purchases');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
};

export const checkPurchase = async (bundleId?: number, paperId?: number): Promise<boolean> => {
  try {
    const params = new URLSearchParams();
    if (bundleId) params.append('bundle_id', bundleId.toString());
    if (paperId) params.append('paper_id', paperId.toString());
    
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/purchases/check/?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to check purchase');
    }
    
    const result = await response.json();
    return result.has_purchased || false;
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
};

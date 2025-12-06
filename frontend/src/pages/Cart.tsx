import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import DynamicIcon from '../components/DynamicIcon';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, removeItem, updateItem, clearCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="mt-1 text-sm text-gray-500">
                {isEmpty ? 'Your cart is empty' : `${cart.total_items} ${cart.total_items === 1 ? 'item' : 'items'} in cart`}
              </p>
            </div>
            {!isEmpty && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <DynamicIcon name="ShoppingCart" className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-sm text-gray-500">
              Start adding some bundles or papers to your cart
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/bundles')}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Bundles
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Item Image/Icon */}
                    <div className="flex-shrink-0">
                      {item.bundle_details?.cover_image ? (
                        <img
                          src={item.bundle_details.cover_image}
                          alt={item.item_name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-lg">
                          <DynamicIcon
                            name={item.item_type === 'bundle' ? 'Package' : 'FileText'}
                            className="h-12 w-12 text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.item_name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.item_type === 'bundle' 
                              ? item.bundle_details?.category_name 
                              : item.paper_details?.category_name}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.item_type === 'bundle' ? 'Bundle' : 'Paper'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Remove from cart"
                        >
                          <DynamicIcon name="Trash" className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Quantity and Price */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <DynamicIcon name="Minus" className="h-4 w-4" />
                          </button>
                          <span className="text-gray-900 font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <DynamicIcon name="Add" className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            ${item.price_at_addition} × {item.quantity}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ${item.subtotal}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">${cart.total_amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">$0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-blue-600">${cart.total_amount}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/bundles')}
                  className="w-full mt-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Continue Shopping
                </button>

                {/* Security Notice */}
                <div className="mt-6 flex items-start gap-2 text-xs text-gray-500">
                  <DynamicIcon name="Shield" className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Secure checkout powered by Razorpay. Your payment information is encrypted and secure.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

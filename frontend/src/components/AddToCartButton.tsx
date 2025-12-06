import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import DynamicIcon from './DynamicIcon';

interface AddToCartButtonProps {
  bundleId?: number;
  paperId?: number;
  isPaid: boolean;
  price?: string;
  className?: string;
}

const AddToCartButton = ({ bundleId, paperId, isPaid, price, className = '' }: AddToCartButtonProps) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addItem, cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if item is already in cart
  const isInCart = cart?.items.some(item => 
    (bundleId && item.bundle === bundleId) || 
    (paperId && item.paper === paperId)
  );

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!isPaid) {
      // Free items don't need to be added to cart
      return;
    }

    setLoading(true);
    try {
      await addItem(bundleId, paperId, 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (!isPaid) {
    return (
      <button
        disabled
        className={`px-6 py-3 bg-green-600 text-white rounded-md font-medium cursor-not-allowed ${className}`}
      >
        FREE
      </button>
    );
  }

  if (isInCart) {
    return (
      <button
        onClick={handleGoToCart}
        className={`px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors font-medium flex items-center justify-center gap-2 ${className}`}
      >
        <DynamicIcon name="ShoppingCart" className="h-5 w-5" />
        View in Cart
      </button>
    );
  }

  if (showSuccess) {
    return (
      <button
        disabled
        className={`px-6 py-3 bg-green-600 text-white rounded-md font-medium flex items-center justify-center gap-2 ${className}`}
      >
        <DynamicIcon name="TickCircle" className="h-5 w-5" />
        Added to Cart!
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Adding...
        </>
      ) : (
        <>
          <DynamicIcon name="ShoppingCart" className="h-5 w-5" />
          Add to Cart - ${price}
        </>
      )}
    </button>
  );
};

export default AddToCartButton;

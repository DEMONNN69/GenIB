import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getOrders, Order as ApiOrder } from '../utils/paymentsApi';
import DynamicIcon from '../components/DynamicIcon';

interface OrderItem {
  id: number;
  item_name: string;
  item_type: string;
  quantity: number;
  price: string;
  subtotal: string;
}

type Order = ApiOrder & {
  items: OrderItem[];
};

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const orders = await getOrders();
      const foundOrder = orders.find((o: ApiOrder) => o.id === parseInt(id));
      
      if (foundOrder) {
        setOrder(foundOrder as Order);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DynamicIcon name="CloseCircle" className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{error || 'Order not found'}</h2>
          <button
            onClick={() => navigate('/purchases')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View My Purchases
          </button>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'completed' || order.payment?.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        {isSuccess && isPaid && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <DynamicIcon name="TickCircle" className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900">Payment Successful!</h2>
                <p className="mt-1 text-sm text-green-700">
                  Thank you for your purchase. Your order has been confirmed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
                <p className="mt-1 text-blue-100">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isPaid
                  ? 'bg-green-500 text-white'
                  : order.status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded flex items-center justify-center ${
                      item.item_type === 'bundle' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <DynamicIcon 
                        name={item.item_type === 'bundle' ? 'Package' : 'FileText'} 
                        className={`h-6 w-6 ${
                          item.item_type === 'bundle' ? 'text-blue-600' : 'text-green-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.item_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.item_type === 'bundle' ? 'Bundle' : 'Paper'} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.subtotal}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">${item.price} each</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-6 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900 capitalize">{order.payment_method}</span>
              </div>
              {order.payment && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-xs text-gray-900">{order.payment.transaction_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`font-medium ${
                      order.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${order.total_amount} {order.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/purchases')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <DynamicIcon name="Eye" className="h-5 w-5" />
                View My Purchases
              </button>
              <button
                onClick={() => navigate('/bundles')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
            
            {/* Download Receipt */}
            <button className="w-full mt-3 px-6 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-2">
              <DynamicIcon name="Download" className="h-4 w-4" />
              Download Receipt
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <DynamicIcon name="InfoCircle" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Need help with your order?</p>
              <p className="text-blue-700">
                Contact our support team at support@genib.com or visit our help center.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

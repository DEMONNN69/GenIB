import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPurchases, UserPurchase } from '../utils/paymentsApi';
import DynamicIcon from '../components/DynamicIcon';

const MyPurchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bundles' | 'papers'>('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUserPurchases();
      setPurchases(data);
    } catch (err) {
      setError('Failed to load purchases. Please try again.');
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    if (filter === 'bundles') return purchase.item_type === 'bundle';
    if (filter === 'papers') return purchase.item_type === 'paper';
    return true;
  });

  const handleItemClick = (purchase: UserPurchase) => {
    if (purchase.item_type === 'bundle') {
      navigate(`/bundles/${purchase.bundle}`);
    } else {
      navigate(`/papers/${purchase.paper}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Access all your purchased bundles and papers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({purchases.length})
          </button>
          <button
            onClick={() => setFilter('bundles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'bundles'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Bundles ({purchases.filter(p => p.item_type === 'bundle').length})
          </button>
          <button
            onClick={() => setFilter('papers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'papers'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Papers ({purchases.filter(p => p.item_type === 'paper').length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <DynamicIcon name="Bag" className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'all' ? 'No purchases yet' : `No ${filter} purchased`}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === 'all'
                ? 'Start browsing bundles and papers to make your first purchase'
                : `Browse our ${filter} to find what you need`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((purchase) => (
              <div
                key={purchase.id}
                onClick={() => handleItemClick(purchase)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Cover Image */}
                {(purchase.bundle_details?.cover_image || purchase.paper_details?.cover_image) ? (
                  <img
                    src={purchase.bundle_details?.cover_image || purchase.paper_details?.cover_image}
                    alt={purchase.item_name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <DynamicIcon
                      name={purchase.item_type === 'bundle' ? 'Package' : 'FileText'}
                      className="h-16 w-16 text-white"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.item_type === 'bundle'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {purchase.item_type === 'bundle' ? 'Bundle' : 'Paper'}
                      </span>
                      {purchase.has_access && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <DynamicIcon name="TickCircle" className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {purchase.item_name}
                    </h3>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Order</span>
                      <span className="font-medium text-gray-900">#{purchase.order_number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Purchased</span>
                      <span className="font-medium text-gray-900">
                        {new Date(purchase.purchased_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Price</span>
                      <span className="font-medium text-blue-600">${purchase.purchase_price}</span>
                    </div>
                  </div>

                  {/* Access Info */}
                  {purchase.expires_at && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <DynamicIcon name="Clock" className="h-4 w-4" />
                        <span>
                          Expires: {new Date(purchase.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <DynamicIcon name="Eye" className="h-4 w-4" />
                    View Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;

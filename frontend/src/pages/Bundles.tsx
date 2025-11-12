import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllBundles, BundleListItem } from '../utils/bundlesApi';
import { getAllCategories, Category } from '../utils/categoriesApi';
import DynamicIcon from '../components/DynamicIcon';

const Bundles = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [bundles, setBundles] = useState<BundleListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  );
  const [filterPaid, setFilterPaid] = useState<boolean | null>(
    searchParams.get('is_paid') ? searchParams.get('is_paid') === 'true' : null
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || '-created_at');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch bundles when filters change
  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const filters: any = {
          ordering: sortBy,
        };
        
        if (selectedCategory) {
          filters.category = selectedCategory;
        }
        if (filterPaid !== null) {
          filters.is_paid = filterPaid;
        }
        if (searchQuery.trim()) {
          filters.search = searchQuery.trim();
        }
        
        const data = await getAllBundles(filters);
        setBundles(data);
      } catch (err) {
        setError('Failed to load bundles. Please try again.');
        console.error('Error fetching bundles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [selectedCategory, filterPaid, searchQuery, sortBy]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set('category', selectedCategory.toString());
    if (filterPaid !== null) params.set('is_paid', filterPaid.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== '-created_at') params.set('ordering', sortBy);
    
    setSearchParams(params);
  }, [selectedCategory, filterPaid, searchQuery, sortBy, setSearchParams]);

  const handleBundleClick = (bundleId: number) => {
    navigate(`/bundles/${bundleId}`);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setFilterPaid(null);
    setSearchQuery('');
    setSortBy('-created_at');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paper Bundles</h1>
              <p className="mt-1 text-sm text-gray-500">
                Browse curated collections of past papers
              </p>
            </div>
            <div className="text-sm text-gray-600">
              {bundles.length} {bundles.length === 1 ? 'bundle' : 'bundles'} found
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {(selectedCategory || filterPaid !== null || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bundles..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="pricing"
                      checked={filterPaid === null}
                      onChange={() => setFilterPaid(null)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">All Bundles</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="pricing"
                      checked={filterPaid === false}
                      onChange={() => setFilterPaid(false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Free Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="pricing"
                      checked={filterPaid === true}
                      onChange={() => setFilterPaid(true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Paid Only</span>
                  </label>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                  <option value="-views_count">Most Viewed</option>
                  <option value="-downloads_count">Most Downloaded</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="-price">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bundles Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : bundles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <DynamicIcon name="Package" className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No bundles found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    onClick={() => handleBundleClick(bundle.id)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Cover Image */}
                    {bundle.cover_image ? (
                      <img
                        src={bundle.cover_image}
                        alt={bundle.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <DynamicIcon name="Package" className="h-16 w-16 text-white" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {bundle.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {bundle.category_name}
                          </p>
                        </div>
                        {bundle.is_featured && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {bundle.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <DynamicIcon name="FileText" className="h-4 w-4" />
                          <span>{bundle.paper_count} papers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DynamicIcon name="Eye" className="h-4 w-4" />
                          <span>{bundle.views_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DynamicIcon name="Download" className="h-4 w-4" />
                          <span>{bundle.downloads_count}</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          {bundle.is_paid ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-blue-600">
                                ${bundle.price}
                              </span>
                              <span className="text-sm text-gray-500">USD</span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-green-600">FREE</span>
                          )}
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                          View Bundle
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bundles;

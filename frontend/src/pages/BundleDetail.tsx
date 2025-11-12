import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBundleById, downloadBundleFile, BundleDetail } from '../utils/bundlesApi';
import DynamicIcon from '../components/DynamicIcon';
import PDFViewer from '../components/PDFViewer';

const BundleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [bundle, setBundle] = useState<BundleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'papers'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBundleDetails();
    }
  }, [id]);

  const fetchBundleDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getBundleById(Number(id));
      setBundle(data);
    } catch (err) {
      setError('Failed to load bundle details. Please try again.');
      console.error('Error fetching bundle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!bundle) return;

    // Check if bundle is paid and show payment modal (placeholder)
    if (bundle.is_paid) {
      setShowPaymentModal(true);
      return;
    }

    setDownloading(true);
    try {
      await downloadBundleFile(bundle.id);
    } catch (err: any) {
      if (err.message.includes('Payment required')) {
        setShowPaymentModal(true);
      } else {
        alert('Failed to download bundle. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleViewPDF = () => {
    if (bundle?.is_paid) {
      setShowPaymentModal(true);
      return;
    }
    setShowPDF(true);
  };

  const handlePaperClick = (paperId: number) => {
    navigate(`/papers/${paperId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600">{error || 'Bundle not found'}</p>
          <button
            onClick={() => navigate('/bundles')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to Bundles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/bundles')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <DynamicIcon name="ArrowLeft" className="h-4 w-4" />
            Back to Bundles
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{bundle.name}</h1>
                {bundle.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-600">{bundle.category_name}</p>
            </div>
            
            <div className="text-right">
              {bundle.is_paid ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">${bundle.price}</span>
                  <span className="text-gray-500">USD</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-green-600">FREE</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('papers')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'papers'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Papers ({bundle.papers.length})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 whitespace-pre-line">{bundle.description}</p>

                    {/* Filters/Tags */}
                    {bundle.filters.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Filters</h3>
                        <div className="flex flex-wrap gap-2">
                          {bundle.filters.map((filter) => (
                            <span
                              key={filter.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {filter.filter_type_name}: {filter.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {bundle.papers.length === 0 ? (
                      <div className="text-center py-8">
                        <DynamicIcon name="FileText" className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500">No papers in this bundle yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bundle.papers.map((paper) => (
                          <div
                            key={paper.id}
                            onClick={() => handlePaperClick(paper.id)}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <DynamicIcon name="FileText" className="h-8 w-8 text-blue-600" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{paper.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                  <span>{paper.category_name}</span>
                                  <span>•</span>
                                  <span>{paper.year}</span>
                                  {paper.month && (
                                    <>
                                      <span>•</span>
                                      <span>{paper.month}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DynamicIcon name="ChevronRight" className="h-5 w-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              {/* Cover Image */}
              {bundle.cover_image ? (
                <img
                  src={bundle.cover_image}
                  alt={bundle.name}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-lg mb-6">
                  <DynamicIcon name="Package" className="h-16 w-16 text-white" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                {bundle.bundle_pdf && (
                  <>
                    <button
                      onClick={handleViewPDF}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <DynamicIcon name="Eye" className="h-5 w-5" />
                      View Bundle PDF
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DynamicIcon name="Download" className="h-5 w-5" />
                      {downloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                  </>
                )}
              </div>

              {/* Statistics */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Papers Included</span>
                  <span className="text-sm font-semibold text-gray-900">{bundle.papers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="text-sm font-semibold text-gray-900">{bundle.views_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Downloads</span>
                  <span className="text-sm font-semibold text-gray-900">{bundle.downloads_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(bundle.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPDF && bundle.bundle_pdf_url && (
        <PDFViewer
          pdfUrl={bundle.bundle_pdf_url}
          paperTitle={bundle.name}
          onClose={() => setShowPDF(false)}
        />
      )}

      {/* Payment Modal (Placeholder) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <DynamicIcon name="Lock" className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Required</h3>
              <p className="text-gray-600 mb-6">
                This bundle is paid content. Payment gateway integration coming soon!
              </p>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">${bundle.price} USD</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleDetailPage;

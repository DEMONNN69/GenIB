import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import PaperCategorySidebar from '../components/PaperCategorySidebar';
import PaperList from '../components/PaperList';
import PDFViewer from '../components/PDFViewer';
import { fetchPapers, toggleFavorite } from '../utils/api';

// TypeScript interfaces
interface Paper {
  id: number;
  title: string;
  curriculum: string;
  subject: string;
  paperNumber: string;
  year: number;
  season: string;
  zone?: string;
  duration?: number;
  type: 'question' | 'marking-scheme' | 'examiner-report';
  isFavorite: boolean;
  totalPages?: number;
}

interface FilterState extends Record<string, string> {
  curriculum: string;
  subject: string;
  paper: string;
  year: string;
  season: string;
  zone: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
}

const PastPapers: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('past-year-papers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    curriculum: '',
    subject: '',
    paper: '',
    year: '',
    season: '',
    zone: ''
  });

  // Filter configurations for the filter bar
  const filterConfigs: FilterConfig[] = [
    {
      key: 'curriculum',
      label: 'Curriculum',
      placeholder: 'Select Curriculum',
      options: [
        { value: 'CIE IGCSE', label: 'CIE IGCSE' },
        { value: 'CIE A-Level', label: 'CIE A-Level' },
        { value: 'Edexcel IGCSE', label: 'Edexcel IGCSE' },
        { value: 'Edexcel A-Level', label: 'Edexcel A-Level' }
      ]
    },
    {
      key: 'subject',
      label: 'Subject',
      placeholder: 'Select Subject',
      options: [
        { value: 'Accounting 9-1(0985)', label: 'Accounting 9-1(0985)' },
        { value: 'Biology 9-1(0970)', label: 'Biology 9-1(0970)' },
        { value: 'Mathematics 9-1(0980)', label: 'Mathematics 9-1(0980)' },
        { value: 'Chemistry 9-1(0971)', label: 'Chemistry 9-1(0971)' },
        { value: 'Physics 9-1(0972)', label: 'Physics 9-1(0972)' }
      ]
    },
    {
      key: 'paper',
      label: 'Paper',
      placeholder: 'Select Paper',
      options: [
        { value: 'Paper 1', label: 'Paper 1' },
        { value: 'Paper 2', label: 'Paper 2' },
        { value: 'Paper 3', label: 'Paper 3' },
        { value: 'Paper 4', label: 'Paper 4' }
      ]
    },
    {
      key: 'year',
      label: 'Year',
      placeholder: 'Select Year',
      options: [
        { value: '2025', label: '2025' },
        { value: '2024', label: '2024' },
        { value: '2023', label: '2023' },
        { value: '2022', label: '2022' },
        { value: '2021', label: '2021' }
      ]
    },
    {
      key: 'season',
      label: 'Season',
      placeholder: 'Select Season',
      options: [
        { value: 'May/June', label: 'May/June' },
        { value: 'Oct/Nov', label: 'Oct/Nov' },
        { value: 'Feb/Mar', label: 'Feb/Mar' }
      ]
    },
    {
      key: 'zone',
      label: 'Zone',
      placeholder: 'Select Zone',
      options: [
        { value: 'Zone 1', label: 'Zone 1' },
        { value: 'Zone 2', label: 'Zone 2' },
        { value: 'Zone 3', label: 'Zone 3' },
        { value: 'Zone 4', label: 'Zone 4' }
      ]
    }
  ];

  useEffect(() => {
    loadPapers();
  }, [filters, activeCategory]);

  const loadPapers = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchPapers({ ...filters, category: activeCategory });
      setPapers(data as Paper[]);
    } catch (error) {
      console.error('Error loading papers:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = (): void => {
    setFilters({
      curriculum: '',
      subject: '',
      paper: '',
      year: '',
      season: '',
      zone: ''
    });
  };

  const handleCategoryChange = (categoryId: string): void => {
    setActiveCategory(categoryId);
    setSelectedPaper(null);
  };

  const handlePaperSelect = (paper: Paper): void => {
    setSelectedPaper(paper);
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (paperId: number): Promise<void> => {
    try {
      await toggleFavorite('paper', paperId);
      setPapers(prev => prev.map(p => 
        p.id === paperId ? { ...p, isFavorite: !p.isFavorite } : p
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = (paper: Paper): void => {
    console.log('Downloading paper:', paper);
    // Implement download logic
  };

  const handlePrint = (): void => {
    console.log('Printing PDF');
    // Implement print logic
  };

  const handleShare = (): void => {
    console.log('Sharing PDF');
    // Implement share logic
  };

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    // Implement search logic
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Filter Bar - Hidden on mobile, shown on tablet+ */}
      <div className="hidden md:block">
        <FilterBar
          filters={filters}
          filterConfigs={filterConfigs}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
        >
          <span className="font-medium">Filters</span>
          <svg className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Mobile Filter Panel */}
        {showMobileFilters && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {filterConfigs.slice(0, 4).map((config) => (
                <select
                  key={config.key}
                  value={filters[config.key as keyof FilterState] || ''}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{config.placeholder}</option>
                  {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filterConfigs.slice(4).map((config) => (
                <select
                  key={config.key}
                  value={filters[config.key as keyof FilterState] || ''}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{config.placeholder}</option>
                  {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-medium border border-blue-200"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Categories - Mobile: Horizontal scroll, Desktop: Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[
                { id: 'past-year-papers', name: 'Past Papers', count: 2450 },
                { id: 'topical-papers', name: 'Topical', count: 1890 },
                { id: 'mock-papers', name: 'Mock', count: 760 },
                { id: 'specimen-papers', name: 'Specimen', count: 340 }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:block">
            <PaperCategorySidebar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Papers and PDF - Mobile: Stack, Desktop: Side by side */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Paper List */}
          <div className="flex-1 lg:max-w-md">
            <PaperList
              papers={papers}
              loading={loading}
              selectedPaper={selectedPaper}
              onPaperSelect={handlePaperSelect}
              onToggleFavorite={handleToggleFavorite}
              onDownload={handleDownload}
            />
          </div>

          {/* PDF Viewer - Hidden on mobile unless paper selected */}
          <div className={`lg:flex-1 lg:min-w-[400px] ${selectedPaper ? 'block' : 'hidden lg:block'}`}>
            {selectedPaper && (
              <div className="lg:hidden bg-white border-b border-gray-200 p-4">
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="flex items-center text-blue-600 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Papers
                </button>
              </div>
            )}
            <PDFViewer
              pdfUrl={selectedPaper ? `/pdfs/${selectedPaper.id}.pdf` : undefined}
              paperTitle={selectedPaper ? `${selectedPaper.curriculum}/${selectedPaper.paperNumber}_${selectedPaper.season.replace('/', '')}_${selectedPaper.year}` : undefined}
              currentPage={currentPage}
              totalPages={selectedPaper?.totalPages || 20}
              onPageChange={setCurrentPage}
              onDownload={() => selectedPaper && handleDownload(selectedPaper)}
              onPrint={handlePrint}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastPapers;

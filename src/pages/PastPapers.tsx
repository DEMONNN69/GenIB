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
      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        filterConfigs={filterConfigs}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Categories */}
        <div className="lg:w-64 flex-shrink-0">
          <PaperCategorySidebar
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Middle and Right sections for mobile/tablet */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Middle - Paper List */}
          <div className="md:w-1/2 lg:w-auto lg:flex-1 flex-shrink-0">
            <PaperList
              papers={papers}
              loading={loading}
              selectedPaper={selectedPaper}
              onPaperSelect={handlePaperSelect}
              onToggleFavorite={handleToggleFavorite}
              onDownload={handleDownload}
            />
          </div>

          {/* Right - PDF Viewer */}
          <div className="md:w-1/2 lg:w-1/2 lg:min-w-[400px] flex-shrink-0">
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

import React from 'react';
import { HeartIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Paper {
  id: number;
  title: string;
  subject: string;
  curriculum: string;
  year: number;
  season: string;
  paperNumber: string;
  zone?: string;
  duration?: number;
  isFavorite: boolean;
  type: 'question' | 'marking-scheme' | 'examiner-report';
}

interface PaperListProps {
  papers: Paper[];
  loading: boolean;
  selectedPaper: Paper | null;
  onPaperSelect: (paper: Paper) => void;
  onToggleFavorite: (paperId: number) => void;
  onDownload?: (paper: Paper) => void;
}

const PaperList: React.FC<PaperListProps> = ({
  papers,
  loading,
  selectedPaper,
  onPaperSelect,
  onToggleFavorite,
  onDownload
}) => {
  const getRowClassName = (paper: Paper) => {
    const baseClasses = "flex items-start lg:items-center px-3 lg:px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150";
    return selectedPaper?.id === paper.id 
      ? `${baseClasses} bg-blue-50 border-l-4 border-blue-600`
      : baseClasses;
  };

  const formatPaperCode = (paper: Paper) => {
    return `${paper.curriculum.replace(/\s+/g, '').substring(0, 4)}/${paper.paperNumber}_${paper.season.replace('/', '')}_${paper.year}`;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center px-4 py-3 border-b border-gray-100">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">Sort by:</span>
            <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Ascending</option>
              <option>Descending</option>
              <option>Year (Latest)</option>
              <option>Year (Oldest)</option>
            </select>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>1 - 25</span>
            <span className="hidden lg:inline">|</span>
            <span>{papers.length} papers</span>
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="overflow-y-auto h-full">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-lg mb-2">No papers found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          papers.map((paper) => (
            <div
              key={paper.id}
              className={getRowClassName(paper)}
              onClick={() => onPaperSelect(paper)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {formatPaperCode(paper)}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2 lg:mt-0 lg:ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(paper.id);
                      }}
                      className={`p-1 rounded ${
                        paper.isFavorite 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      {paper.isFavorite ? (
                        <HeartSolidIcon className="h-4 w-4" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                    </button>
                    
                    {onDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(paper);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-blue-600"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-1 flex flex-wrap items-center gap-1 lg:gap-4 text-xs text-gray-500">
                  <span>{paper.subject}</span>
                  <span className="hidden lg:inline">•</span>
                  <span>{paper.year}</span>
                  <span className="hidden lg:inline">•</span>
                  <span>{paper.season}</span>
                  {paper.zone && (
                    <>
                      <span className="hidden lg:inline">•</span>
                      <span>{paper.zone}</span>
                    </>
                  )}
                  {paper.duration && (
                    <>
                      <span className="hidden lg:inline">•</span>
                      <span>{paper.duration} min</span>
                    </>
                  )}
                </div>

                {/* Paper Type Badges */}
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    paper.type === 'question' 
                      ? 'bg-blue-100 text-blue-800'
                      : paper.type === 'marking-scheme'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {paper.type === 'question' ? 'Question Paper' :
                     paper.type === 'marking-scheme' ? 'Mark Scheme' : 'Examiner Report'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaperList;

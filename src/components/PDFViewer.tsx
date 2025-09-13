import React, { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PDFViewerProps {
  pdfUrl?: string;
  paperTitle?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onFullscreen?: () => void;
  onClose?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  paperTitle = "Select a paper to view",
  currentPage = 1,
  totalPages = 20,
  onPageChange,
  onDownload,
  onPrint,
  onShare,
  onFullscreen,
  onClose
}) => {
  const [zoom, setZoom] = useState(78);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">{paperTitle}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-1 text-sm">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => onPageChange?.(parseInt(e.target.value) || 1)}
                className="w-12 px-1 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white text-xs"
                min="1"
                max={totalPages}
              />
              <span>/ {totalPages}</span>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-700"
              title="Zoom Out"
            >
              <MagnifyingGlassMinusIcon className="h-5 w-5" />
            </button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-700"
              title="Zoom In"
            >
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 border-l border-gray-700 pl-2">
            <button
              onClick={onShare}
              className="p-1 rounded hover:bg-gray-700"
              title="Share"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-1 rounded hover:bg-gray-700"
              title="Download"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onPrint}
              className="p-1 rounded hover:bg-gray-700"
              title="Print"
            >
              <PrinterIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onFullscreen}
              className="p-1 rounded hover:bg-gray-700"
              title="Fullscreen"
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 bg-gray-600 overflow-auto">
        {pdfUrl ? (
          <div className="flex justify-center p-4">
            <div 
              className="bg-white shadow-2xl rounded-lg overflow-hidden"
              style={{ 
                width: `${zoom}%`,
                maxWidth: '100%'
              }}
            >
              {/* Mock PDF Content - Replace with actual PDF viewer */}
              <div className="aspect-[8.5/11] bg-white p-8 text-black">
                <div className="border-2 border-gray-300 p-6 h-full">
                  <div className="text-center mb-6">
                    <div className="text-xs mb-2">Cambridge Assessment International Education</div>
                    <h1 className="text-lg font-bold mb-2">Cambridge IGCSE™ (9-1)</h1>
                    <div className="text-sm mb-4">ACCOUNTING</div>
                    <div className="text-sm mb-2">Paper 2 Structured Written Paper</div>
                    <div className="text-xs">0985/22 May/June 2025</div>
                    <div className="text-xs">1 hour 45 minutes</div>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="border border-black p-2">
                      <div className="flex justify-between">
                        <div>
                          <div>CANDIDATE NAME</div>
                          <div className="border-b border-black h-6"></div>
                        </div>
                        <div className="text-right">
                          <div>CANDIDATE NUMBER</div>
                          <div className="border-b border-black h-6 w-20"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <p>• Answer all questions.</p>
                      <p>• Write your answers in the spaces provided.</p>
                      <p>• Show all working.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg">Select a paper from the list to view</p>
              <p className="text-sm mt-2">Papers will be displayed here in PDF format</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <button className="flex items-center space-x-1 hover:text-white">
            <span>Question</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-white">
            <span>Answer</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-white">
            <span>Extra Files</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          Download PDF
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

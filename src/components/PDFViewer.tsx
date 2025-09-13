import React, { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextPage();
    }
    if (isRightSwipe) {
      handlePreviousPage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 lg:px-4 py-2 bg-gray-800 border-b border-gray-700 space-y-2 lg:space-y-0">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-xs lg:text-sm font-medium truncate">{paperTitle}</span>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end space-x-2 lg:space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="p-1 lg:p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous"
            >
              <ChevronLeftIcon className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
            
            <div className="flex items-center space-x-1 text-xs lg:text-sm">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => onPageChange?.(parseInt(e.target.value) || 1)}
                className="w-8 lg:w-12 px-1 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white text-xs"
                min="1"
                max={totalPages}
              />
              <span>/ {totalPages}</span>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 lg:p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next"
            >
              <ChevronRightIcon className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
          </div>

          {/* Zoom Controls - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-1">
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

          {/* Mobile Action Buttons - Simplified */}
          <div className="flex items-center space-x-1 lg:hidden">
            <button
              onClick={onDownload}
              className="p-2 rounded hover:bg-gray-700 bg-blue-600"
              title="Download"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onShare}
              className="p-2 rounded hover:bg-gray-700"
              title="Share"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-1 border-l border-gray-700 pl-2">
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
      <div 
        className="flex-1 bg-gray-600 overflow-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {pdfUrl ? (
          <div className="flex justify-center p-2 lg:p-4">
            <div 
              className="bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-full lg:max-w-4xl"
              style={{ 
                width: `min(100%, ${zoom}%)`,
              }}
            >
              {/* Mock PDF Content - Replace with actual PDF viewer */}
              <div className="aspect-[8.5/11] bg-white p-4 lg:p-8 text-black text-xs lg:text-sm">
                <div className="border-2 border-gray-300 p-3 lg:p-6 h-full">
                  <div className="text-center mb-4 lg:mb-6">
                    <div className="text-xs mb-2">Cambridge Assessment International Education</div>
                    <h1 className="text-sm lg:text-lg font-bold mb-2">Cambridge IGCSE™ (9-1)</h1>
                    <div className="text-xs lg:text-sm mb-4">ACCOUNTING</div>
                    <div className="text-xs lg:text-sm mb-2">Paper 2 Structured Written Paper</div>
                    <div className="text-xs">0985/22 May/June 2025</div>
                    <div className="text-xs">1 hour 45 minutes</div>
                  </div>
                  
                  <div className="space-y-2 lg:space-y-4 text-xs lg:text-sm">
                    <div className="border border-black p-1 lg:p-2">
                      <div className="flex flex-col lg:flex-row lg:justify-between space-y-2 lg:space-y-0">
                        <div>
                          <div>CANDIDATE NAME</div>
                          <div className="border-b border-black h-4 lg:h-6"></div>
                        </div>
                        <div className="lg:text-right">
                          <div>CANDIDATE NUMBER</div>
                          <div className="border-b border-black h-4 lg:h-6 w-full lg:w-20"></div>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 lg:px-4 py-2 bg-gray-800 border-t border-gray-700 space-y-2 lg:space-y-0">
        <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-300">
          <button className="flex items-center space-x-1 hover:text-white py-1 px-2 rounded">
            <span>Question</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-white py-1 px-2 rounded">
            <span>Answer</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-white py-1 px-2 rounded">
            <span>Extra Files</span>
          </button>
        </div>
        
        {/* Mobile zoom controls */}
        <div className="flex lg:hidden items-center justify-center space-x-4">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-gray-700 bg-gray-700"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
          </button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-gray-700 bg-gray-700"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-400 text-center lg:text-right">
          Download PDF
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

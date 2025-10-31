import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon, ClockIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { fetchPaperById, toggleFavorite } from '../utils/api';

interface Paper {
  id: number;
  title: string;
  subject: string;
  curriculum: string;
  year: number;
  season: string;
  paperNumber?: string;
  zone?: string;
  duration?: number;
  type: 'question' | 'marking-scheme' | 'examiner-report';
  totalPages?: number;
  isFavorite: boolean;
  questions?: number[];
}

const PaperDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPaper();
    }
  }, [id]);

  const loadPaper = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const paperData = await fetchPaperById(id);
      setPaper(paperData ? paperData as Paper : null);
      
      // For now, we don't have questions linked to papers in the mock data
      // This would be implemented when we have a real backend
      // if (paperData?.questions) {
      //   const questionPromises = paperData.questions.map(qId => fetchQuestionById(qId));
      //   const questionsData = await Promise.all(questionPromises);
      //   setQuestions(questionsData.filter((q): q is Question => q !== undefined));
      // }
    } catch (error) {
      console.error('Error loading paper:', error);
    }
    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!paper) return;
    
    try {
      await toggleFavorite('paper', paper.id);
      setPaper(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = () => {
    console.log('Downloading paper:', paper?.title);
    // Implement download logic
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Paper Not Found</h1>
        <p className="text-gray-600 mb-6">The paper you're looking for doesn't exist.</p>
        <Link
          to="/papers"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Papers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/papers"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Past Papers
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{paper.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {paper.subject}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                {paper.curriculum}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                {paper.year} {paper.season}
              </span>
              {paper.zone && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {paper.zone}
                </span>
              )}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                paper.type === 'question' ? 'bg-blue-100 text-blue-800' :
                paper.type === 'marking-scheme' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {paper.type === 'question' ? 'Question Paper' :
                 paper.type === 'marking-scheme' ? 'Marking Scheme' : 'Examiner Report'}
              </span>
              {paper.duration && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {paper.duration} min
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-lg transition-colors duration-200 ${
                paper.isFavorite 
                  ? 'text-red-600 hover:text-red-700 bg-red-50' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {paper.isFavorite ? (
                <HeartSolidIcon className="h-6 w-6" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
            </button>
            
            <button
              onClick={handleDownload}
              className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="Download PDF"
            >
              <ArrowDownTrayIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Paper Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Paper Preview</h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">PDF preview will be shown here</p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paper Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{paper.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Curriculum:</span>
                <span className="font-medium">{paper.curriculum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{paper.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Season:</span>
                <span className="font-medium">{paper.season}</span>
              </div>
              {paper.paperNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paper:</span>
                  <span className="font-medium">{paper.paperNumber}</span>
                </div>
              )}
              {paper.zone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Zone:</span>
                  <span className="font-medium">{paper.zone}</span>
                </div>
              )}
              {paper.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{paper.duration} minutes</span>
                </div>
              )}
              {paper.totalPages && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{paper.totalPages}</span>
                </div>
              )}
            </div>
          </div>

          {/* Related Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
            <div className="space-y-3">
              <button className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
                <h4 className="font-medium text-gray-900 mb-1">Marking Scheme</h4>
                <p className="text-sm text-gray-600">Detailed marking criteria and answers</p>
              </button>
              
              <button className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
                <h4 className="font-medium text-gray-900 mb-1">Examiner Report</h4>
                <p className="text-sm text-gray-600">Common mistakes and improvement tips</p>
              </button>
              
              <Link
                to="/exam-builder"
                className="block w-full bg-blue-600 text-white rounded-lg p-4 text-left hover:bg-blue-700 transition-colors"
              >
                <h4 className="font-medium mb-1">Practice Similar</h4>
                <p className="text-sm text-blue-100">Create custom test with similar questions</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetail;

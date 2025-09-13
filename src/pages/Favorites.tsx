import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { fetchFavorites } from '../utils/api';

interface Question {
  id: number;
  title: string;
  subject: string;
  curriculum: string;
  year: number;
  season: string;
  difficulty: string;
  content: string;
  answer: string;
  isFavorite: boolean;
}

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
}

interface FavoritesData {
  questions: Question[];
  papers: Paper[];
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoritesData>({ questions: [], papers: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'papers'>('questions');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await fetchFavorites();
      setFavorites(data as FavoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setLoading(false);
  };

  const TabButton: React.FC<{ 
    tabId: 'questions' | 'papers'; 
    label: string; 
    count: number;
  }> = ({ tabId, label, count }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center px-6 py-3 font-medium rounded-lg transition-colors duration-200 ${
        activeTab === tabId
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        activeTab === tabId
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex space-x-4 mb-8">
            <div className="h-12 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">Access your saved questions and papers for quick reference</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <TabButton 
          tabId="questions" 
          label="Questions" 
          count={favorites.questions.length} 
        />
        <TabButton 
          tabId="papers" 
          label="Papers" 
          count={favorites.papers.length} 
        />
      </div>

      {/* Content */}
      {activeTab === 'questions' ? (
        <div>
          {favorites.questions.length === 0 ? (
            <div className="text-center py-12">
              <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No favorite questions yet</p>
              <p className="text-gray-400 mb-6">Start adding questions to your favorites to see them here</p>
              <Link
                to="/questions"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Questions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.questions.map((question) => (
                <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <EyeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <HeartIcon className="h-5 w-5 text-red-600 fill-current" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {question.subject}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {question.curriculum}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600">{question.year} {question.season}</p>
                  </div>

                  <Link
                    to={`/questions/${question.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    View Question
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {favorites.papers.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No favorite papers yet</p>
              <p className="text-gray-400 mb-6">Start adding papers to your favorites to see them here</p>
              <Link
                to="/papers"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Papers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.papers.map((paper) => (
                <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <HeartIcon className="h-5 w-5 text-red-600 fill-current" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {paper.subject}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {paper.curriculum}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        paper.type === 'question' ? 'bg-blue-100 text-blue-800' :
                        paper.type === 'marking-scheme' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {paper.type === 'question' ? 'Question Paper' :
                         paper.type === 'marking-scheme' ? 'Marking Scheme' : 'Examiner Report'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{paper.year} {paper.season}</span>
                      {paper.duration && <span>{paper.duration} min</span>}
                      {paper.zone && <span>{paper.zone}</span>}
                    </div>
                  </div>

                  <Link
                    to={`/papers/${paper.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    View Paper
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;

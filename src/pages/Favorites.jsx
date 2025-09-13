import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { fetchFavorites } from '../utils/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState({ questions: [], papers: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await fetchFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-gray-600">Quick access to your saved questions and papers</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Questions ({favorites.questions.length})
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'papers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Papers ({favorites.papers.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  {favorites.questions.length === 0 ? (
                    <div className="text-center py-12">
                      <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No favorite questions yet</p>
                      <p className="text-gray-400 text-sm mb-4">
                        Start browsing questions and save your favorites
                      </p>
                      <Link
                        to="/questions"
                        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Questions
                      </Link>
                    </div>
                  ) : (
                    favorites.questions.map(question => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{question.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.content}</p>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {question.subject}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                {question.curriculum}
                              </span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                {question.year} {question.season}
                              </span>
                            </div>
                          </div>
                          
                          <Link
                            to={`/questions/${question.id}`}
                            className="ml-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Papers Tab */}
              {activeTab === 'papers' && (
                <div className="space-y-4">
                  {favorites.papers.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No favorite papers yet</p>
                      <p className="text-gray-400 text-sm mb-4">
                        Browse past papers and save your favorites
                      </p>
                      <Link
                        to="/papers"
                        className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Papers
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.papers.map(paper => (
                        <div key={paper.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <HeartIcon className="h-5 w-5 text-red-600 fill-current" />
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2">{paper.title}</h3>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {paper.subject}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                {paper.curriculum}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <span>{paper.duration} min • {paper.year} {paper.season}</span>
                            </div>
                          </div>

                          <Link
                            to={`/papers/${paper.id}`}
                            className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            View Paper
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
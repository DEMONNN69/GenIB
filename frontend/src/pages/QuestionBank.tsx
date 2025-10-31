import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
// import { fetchQuestions, toggleFavorite } from '../utils/api';

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

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    curriculum: '',
    year: '',
    season: '',
    difficulty: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const subjects = ['Biology', 'Mathematics', 'English Literature', 'Chemistry', 'Physics'];
  const curriculums = ['Cambridge IGCSE', 'Cambridge A-Level', 'Edexcel IGCSE'];
  const years = ['2023', '2022', '2021', '2020'];
  const seasons = ['May/June', 'Oct/Nov', 'Feb/Mar'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestions(filters);
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      curriculum: '',
      year: '',
      season: '',
      difficulty: ''
    });
  };

  const handleToggleFavorite = async (questionId: number) => {
    try {
      await toggleFavorite('question', questionId);
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, isFavorite: !q.isFavorite } : q
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Bank</h1>
        <p className="text-gray-600">Browse thousands of exam questions by subject and curriculum</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum</label>
                <select
                  value={filters.curriculum}
                  onChange={(e) => handleFilterChange('curriculum', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Curriculums</option>
                  {curriculums.map(curriculum => (
                    <option key={curriculum} value={curriculum}>{curriculum}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                <select
                  value={filters.season}
                  onChange={(e) => handleFilterChange('season', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Seasons</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${questions.length} questions found`}
        </p>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map(question => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {question.subject}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      {question.curriculum}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {question.year} {question.season}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleFavorite(question.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      question.isFavorite 
                        ? 'text-red-600 hover:text-red-700 bg-red-50' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {question.isFavorite ? (
                      <HeartSolidIcon className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>
                  
                  <Link
                    to={`/questions/${question.id}`}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No questions found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters to see all questions
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
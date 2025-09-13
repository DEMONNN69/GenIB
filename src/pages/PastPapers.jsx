import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, HeartIcon, ClockIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { fetchPapers, toggleFavorite } from '../utils/api';

const PastPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    curriculum: '',
    year: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const subjects = ['Biology', 'Mathematics', 'English Literature', 'Chemistry', 'Physics'];
  const curriculums = ['Cambridge IGCSE', 'Cambridge A-Level', 'Edexcel IGCSE'];
  const years = ['2023', '2022', '2021', '2020'];

  useEffect(() => {
    loadPapers();
  }, [filters]);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const data = await fetchPapers(filters);
      setPapers(data);
    } catch (error) {
      console.error('Error loading papers:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      curriculum: '',
      year: ''
    });
  };

  const handleToggleFavorite = async (paperId) => {
    try {
      await toggleFavorite('paper', paperId);
      setPapers(prev => prev.map(p => 
        p.id === paperId ? { ...p, isFavorite: !p.isFavorite } : p
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Past Papers</h1>
        <p className="text-gray-600">Access complete past papers with marking schemes and model answers</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
          {loading ? 'Loading...' : `${papers.length} papers found`}
        </p>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map(paper => (
            <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <button
                  onClick={() => handleToggleFavorite(paper.id)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    paper.isFavorite 
                      ? 'text-red-600 hover:text-red-700 bg-red-50' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  {paper.isFavorite ? (
                    <HeartSolidIcon className="h-5 w-5" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </button>
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
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{paper.duration} min</span>
                  </div>
                  <span>{paper.year} {paper.season}</span>
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

      {!loading && papers.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No papers found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters to see all papers
          </button>
        </div>
      )}
    </div>
  );
};

export default PastPapers;
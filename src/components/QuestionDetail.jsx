import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { fetchQuestionById, toggleFavorite } from '../utils/api';

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestionById(id);
      setQuestion(data);
    } catch (error) {
      console.error('Error loading question:', error);
    }
    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!question) return;
    
    try {
      await toggleFavorite('question', question.id);
      setQuestion(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Question not found</p>
          <Link
            to="/questions"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/questions"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Questions
        </Link>
      </div>

      {/* Question Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <button
            onClick={handleToggleFavorite}
            className={`p-3 rounded-lg transition-colors duration-200 ${
              question.isFavorite 
                ? 'text-red-600 hover:text-red-700 bg-red-50' 
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            {question.isFavorite ? (
              <HeartSolidIcon className="h-6 w-6" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {question.subject}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
            {question.curriculum}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {question.year} {question.season}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty}
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Question</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{question.content}</p>
          </div>
        </div>

        {/* Answer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Answer</h2>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showAnswer 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          </div>
          
          {showAnswer ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{question.answer}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <p>Click "Show Answer" to reveal the solution</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Actions */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/exam-builder"
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add to Custom Exam
          </Link>
          <Link
            to={`/questions?subject=${question.subject}`}
            className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            More {question.subject} Questions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
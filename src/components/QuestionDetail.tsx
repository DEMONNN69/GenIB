import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { fetchQuestionById, toggleFavorite } from '../utils/api';

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

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await fetchQuestionById(id);
      setQuestion(data ? data as Question : null);
    } catch (error) {
      console.error('Error loading question:', error);
    }
    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!question) return;
    
    try {
      await toggleFavorite('question', question.id);
      setQuestion(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
        <p className="text-gray-600 mb-6">The question you're looking for doesn't exist.</p>
        <Link
          to="/questions"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/questions"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Question Bank
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
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
      </div>

      {/* Question Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Question</h2>
        <div className="prose max-w-none text-gray-700">
          {question.content}
        </div>
      </div>

      {/* Answer Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Answer</h2>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
        </div>

        {showAnswer && (
          <div className="prose max-w-none text-gray-700 bg-blue-50 p-6 rounded-lg">
            {question.answer}
          </div>
        )}
      </div>

      {/* Related Questions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/questions/2"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <h4 className="font-medium text-gray-900 mb-2">Quadratic Equations</h4>
            <p className="text-sm text-gray-600">Mathematics • 2023 Oct/Nov</p>
          </Link>
          <Link
            to="/questions/3"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <h4 className="font-medium text-gray-900 mb-2">Shakespeare's Themes</h4>
            <p className="text-sm text-gray-600">English Literature • 2022 May/June</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;

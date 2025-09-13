import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { fetchPaperById, toggleFavorite, fetchQuestionById } from '../utils/api';

const PaperDetail = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaper();
  }, [id]);

  const loadPaper = async () => {
    setLoading(true);
    try {
      const paperData = await fetchPaperById(id);
      setPaper(paperData);
      
      // Load questions for this paper
      if (paperData?.questions) {
        const questionPromises = paperData.questions.map(qId => fetchQuestionById(qId));
        const questionsData = await Promise.all(questionPromises);
        setQuestions(questionsData.filter(q => q !== undefined));
      }
    } catch (error) {
      console.error('Error loading paper:', error);
    }
    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!paper) return;
    
    try {
      await toggleFavorite('paper', paper.id);
      setPaper(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Paper not found</p>
          <Link
            to="/papers"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Papers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/papers"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Papers
        </Link>
      </div>

      {/* Paper Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{paper.duration} minutes</span>
                </div>
                <span>•</span>
                <span>{paper.year} {paper.season}</span>
                <span>•</span>
                <span>{questions.length} questions</span>
              </div>
            </div>
          </div>
          
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
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {paper.subject}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
            {paper.curriculum}
          </span>
        </div>
      </div>

      {/* Paper Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions</h3>
        <ul className="text-yellow-700 text-sm space-y-1 list-disc ml-5">
          <li>Answer ALL questions in this section</li>
          <li>Write your answers in the spaces provided</li>
          <li>Show all your working clearly</li>
          <li>Calculator may be used</li>
        </ul>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
        
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-gray-500">Questions for this paper will be available soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
                    <div className="prose prose-sm max-w-none mb-4">
                      <p className="text-gray-700">{question.content}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {Math.floor(paper.duration / questions.length)} min
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/questions/${question.id}`}
                    className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Resources */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
            <h4 className="font-medium text-gray-900 mb-1">Marking Scheme</h4>
            <p className="text-sm text-gray-600">Detailed marking criteria and model answers</p>
          </button>
          
          <button className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
            <h4 className="font-medium text-gray-900 mb-1">Examiner Report</h4>
            <p className="text-sm text-gray-600">Common mistakes and improvement tips</p>
          </button>
          
          <Link
            to="/exam-builder"
            className="bg-blue-600 text-white rounded-lg p-4 text-left hover:bg-blue-700 transition-colors"
          >
            <h4 className="font-medium mb-1">Practice Similar</h4>
            <p className="text-sm text-blue-100">Create custom test with similar questions</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaperDetail;
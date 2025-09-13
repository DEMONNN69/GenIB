import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { fetchQuestions, createExam } from '../utils/api';

const ExamBuilder = () => {
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [examName, setExamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    curriculum: ''
  });

  const subjects = ['Biology', 'Mathematics', 'English Literature', 'Chemistry', 'Physics'];
  const curriculums = ['Cambridge IGCSE', 'Cambridge A-Level', 'Edexcel IGCSE'];

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestions(filters);
      setAvailableQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addQuestion = (question) => {
    if (!selectedQuestions.find(q => q.id === question.id)) {
      setSelectedQuestions(prev => [...prev, question]);
    }
  };

  const removeQuestion = (questionId) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const saveExam = async () => {
    if (!examName.trim() || selectedQuestions.length === 0) {
      alert('Please enter an exam name and select at least one question.');
      return;
    }

    setSaving(true);
    try {
      const examData = {
        name: examName,
        questions: selectedQuestions.map(q => q.id)
      };
      
      await createExam(examData);
      alert('Exam created successfully!');
      setExamName('');
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Builder</h1>
        <p className="text-gray-600">Create custom practice tests by selecting questions from the question bank</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Questions</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            </div>

            {/* Questions List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                availableQuestions.map(question => (
                  <div key={question.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{question.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {question.subject}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => addQuestion(question)}
                        disabled={selectedQuestions.find(q => q.id === question.id)}
                        className={`ml-3 p-2 rounded-lg transition-colors ${
                          selectedQuestions.find(q => q.id === question.id)
                            ? 'bg-green-100 text-green-600 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {selectedQuestions.find(q => q.id === question.id) ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <PlusCircleIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Exam Builder */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Build Your Exam</h2>
            
            {/* Exam Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Name</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="Enter a name for your custom exam"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Selected Questions */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Selected Questions ({selectedQuestions.length})
              </h3>
              
              {selectedQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <PlusCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No questions selected yet</p>
                  <p className="text-sm">Add questions from the left panel</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedQuestions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                          <span className="text-sm font-medium text-gray-900">{question.title}</span>
                        </div>
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {question.subject}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exam Stats */}
            {selectedQuestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Exam Overview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total Questions:</span>
                    <span className="ml-2 font-medium">{selectedQuestions.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Estimated Time:</span>
                    <span className="ml-2 font-medium">{selectedQuestions.length * 3} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={saveExam}
              disabled={!examName.trim() || selectedQuestions.length === 0 || saving}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? 'Creating Exam...' : 'Create Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamBuilder;
import React, { useState, useEffect } from 'react';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchProfile, updateProfile } from '../utils/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    curriculum: '',
    subjects: []
  });

  const curriculums = ['Cambridge IGCSE', 'Cambridge A-Level', 'Edexcel IGCSE', 'IB Diploma'];
  const availableSubjects = ['Biology', 'Mathematics', 'English Literature', 'Chemistry', 'Physics', 'History', 'Geography', 'Economics'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchProfile();
      setProfile(data);
      setEditForm({
        name: data.name,
        email: data.email,
        curriculum: data.curriculum,
        subjects: data.subjects
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      name: profile.name,
      email: profile.email,
      curriculum: profile.curriculum,
      subjects: profile.subjects
    });
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await updateProfile(editForm);
      setProfile(updatedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSubjectToggle = (subject) => {
    setEditForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center space-x-2 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum</label>
                {editing ? (
                  <select
                    value={editForm.curriculum}
                    onChange={(e) => setEditForm(prev => ({ ...prev, curriculum: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {curriculums.map(curriculum => (
                      <option key={curriculum} value={curriculum}>{curriculum}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.curriculum}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                {editing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSubjects.map(subject => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editForm.subjects.includes(subject)}
                          onChange={() => handleSubjectToggle(subject)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.map(subject => (
                      <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Questions Solved</span>
                <span className="font-semibold text-gray-900">{profile.totalQuestionsSolved}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Favorites Saved</span>
                <span className="font-semibold text-gray-900">{profile.favoriteCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Custom Exams</span>
                <span className="font-semibold text-gray-900">{profile.createdExams}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Account Level</h3>
                <p className="text-sm text-gray-600">Active Student</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Keep practicing to unlock more features and track your progress!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import { fetchProfile, updateProfile } from '../utils/api';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  curriculum: string;
  subjects: string[];
  totalQuestionsSolved: number;
  favoriteCount: number;
  createdExams: number;
}

interface EditForm {
  name: string;
  email: string;
  curriculum: string;
  subjects: string[];
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
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
      setProfile(data as ProfileData);
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
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        curriculum: profile.curriculum,
        subjects: profile.subjects
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await updateProfile(editForm);
      setProfile(updatedProfile as ProfileData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject: string) => {
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
            <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
        <p className="text-gray-600">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Profile Picture and Basic Info */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full Name"
                      />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email Address"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Curriculum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum</label>
                {editing ? (
                  <select
                    value={editForm.curriculum}
                    onChange={(e) => handleInputChange('curriculum', e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Curriculum</option>
                    {curriculums.map(curriculum => (
                      <option key={curriculum} value={curriculum}>{curriculum}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{profile.curriculum}</p>
                )}
              </div>

              {/* Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                {editing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                      <span
                        key={subject}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Questions Solved</span>
                <span className="text-2xl font-bold text-blue-600">{profile.totalQuestionsSolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Favorites</span>
                <span className="text-2xl font-bold text-red-600">{profile.favoriteCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Custom Exams</span>
                <span className="text-2xl font-bold text-green-600">{profile.createdExams}</span>
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

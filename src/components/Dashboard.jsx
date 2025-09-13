import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickStats = [
    { label: 'Questions Solved', value: '145', icon: QuestionMarkCircleIcon, color: 'text-blue-600' },
    { label: 'Papers Completed', value: '23', icon: DocumentTextIcon, color: 'text-green-600' },
    { label: 'Favorites Saved', value: '34', icon: HeartIcon, color: 'text-red-600' },
    { label: 'Custom Exams', value: '8', icon: PlusCircleIcon, color: 'text-purple-600' },
  ];

  const quickLinks = [
    {
      title: 'Question Bank',
      description: 'Browse thousands of exam questions by subject and curriculum',
      href: '/questions',
      icon: QuestionMarkCircleIcon,
      color: 'bg-blue-500',
      stats: '2,450+ Questions'
    },
    {
      title: 'Past Papers',
      description: 'Access complete past papers with marking schemes',
      href: '/papers',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      stats: '450+ Papers'
    },
    {
      title: 'Exam Builder',
      description: 'Create custom practice tests from question bank',
      href: '/exam-builder',
      icon: PlusCircleIcon,
      color: 'bg-purple-500',
      stats: 'Build Custom Tests'
    },
    {
      title: 'My Favorites',
      description: 'Quick access to your saved questions and papers',
      href: '/favorites',
      icon: HeartIcon,
      color: 'bg-red-500',
      stats: 'Your Collection'
    }
  ];

  const recentActivity = [
    { type: 'question', title: 'Photosynthesis Process - Biology', time: '2 hours ago' },
    { type: 'paper', title: 'Mathematics Paper 2 - May/June 2023', time: '5 hours ago' },
    { type: 'exam', title: 'Created "Biology Practice Test"', time: '1 day ago' },
    { type: 'favorite', title: 'Added to favorites: Quadratic Equations', time: '2 days ago' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
        <p className="text-gray-600">Ready to continue your exam preparation journey?</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for questions, papers, topics, or subjects..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={index}
              to={link.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-xl ${link.color} text-white group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {link.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{link.description}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{link.stats}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'question' ? 'bg-blue-500' :
                  activity.type === 'paper' ? 'bg-green-500' :
                  activity.type === 'exam' ? 'bg-purple-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
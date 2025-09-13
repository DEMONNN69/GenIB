import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  HeartIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Question Bank', href: '/questions', icon: QuestionMarkCircleIcon },
    { name: 'Past Papers', href: '/papers', icon: DocumentTextIcon },
    { name: 'Exam Builder', href: '/exam-builder', icon: PlusCircleIcon },
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
          <span className="text-xl font-semibold text-gray-800">Menu</span>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-xs text-gray-600 mb-3">
              Access our study guides and exam tips
            </p>
            <button className="w-full bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
              View Resources
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
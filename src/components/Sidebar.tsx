import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  Home2,
  DocumentText,
  MessageQuestion,
  Book,
  ClipboardText,
  Teacher,
  Building4,
  Star,
  DocumentCode2,
  Heart,
  Profile,
  Building
} from 'iconsax-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const paperCategories = [
    { 
      name: 'Past Year Papers', 
      href: '/papers', 
      icon: DocumentText,
      description: 'Free, PDF, downloadable',
      count: 2450,
      isMain: true
    },
    { 
      name: 'Topical Past Papers', 
      href: '/papers', 
      icon: Book,
      description: 'Not free, online, not downloadable',
      count: 1890
    },
    { 
      name: 'MCQ Past Papers', 
      href: '/papers', 
      icon: MessageQuestion,
      description: 'Not free, online practice',
      count: 980
    },
    { 
      name: 'Non-Topical Past Papers', 
      href: '/papers', 
      icon: ClipboardText,
      description: 'Free, online, not downloadable',
      count: 760
    },
    { 
      name: 'Solved Past Papers', 
      href: '/papers', 
      icon: Teacher,
      description: 'Not free, PDF, downloadable',
      count: 340
    },
    { 
      name: 'GenIB Question Bank', 
      href: '/questions', 
      icon: Building4,
      description: 'Free, online, not downloadable',
      count: 5600
    },
    { 
      name: 'ACT, SAT, AP', 
      href: '/papers', 
      icon: Star,
      description: 'Free, online, not downloadable',
      count: 180
    },
    { 
      name: 'Build Exam or Worksheet', 
      href: '/exam-builder', 
      icon: DocumentCode2,
      description: 'Not free, convert to PDF, printable'
    }
  ];

  const otherLinks = [
    { name: 'Dashboard', href: '/', icon: Home2 },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Profile', href: '/profile', icon: Profile }
  ];

  const isActive = (path: string) => location.pathname === path;

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
        lg:translate-x-0 lg:relative lg:inset-auto
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

        <div className="h-full overflow-y-auto">
          {/* Quick Links */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h3>
            <ul className="space-y-1">
              {otherLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                        ${isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon 
                        variant={isActive(item.href) ? "Bold" : "Outline"} 
                        size={20} 
                        className="mr-3" 
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Paper Categories */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Paper Categories</h3>
            <ul className="space-y-1">
              {paperCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <li key={category.name}>
                    <Link
                      to={category.href}
                      onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                      className={`
                        block p-3 rounded-lg transition-colors duration-200 group
                        ${isActive(category.href)
                          ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          isActive(category.href) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          <Icon 
                            variant={isActive(category.href) ? "Bold" : "Outline"} 
                            size={20} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium truncate ${
                              isActive(category.href) ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {category.name}
                            </h4>
                            {category.count && (
                              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                                isActive(category.href) 
                                  ? 'bg-blue-200 text-blue-800' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {category.count.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            isActive(category.href) ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Building variant="Bold" size={24} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">For Schools</h3>
            <p className="text-xs text-gray-600 mb-3">
              Get access to premium content and advanced features for your institution
            </p>
            <button className="w-full bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
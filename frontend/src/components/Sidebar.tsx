import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  Home2,
  Heart,
  Profile,
  Building, 
} from 'iconsax-react';
import { getAllCategories, type Category } from '../utils/categoriesApi';
import DynamicIcon from './DynamicIcon';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarCategory {
  id: number;
  name: string;
  href: string;
  iconName: string; // Changed from icon to iconName
  description: string;
  count: number;
  isMain: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [paperCategories, setPaperCategories] = useState<SidebarCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getAllCategories();
        
        // Map backend data to frontend format
        const mappedCategories: SidebarCategory[] = categories.map((cat: Category) => ({
          id: cat.id,
          name: cat.name,
          href: cat.name === 'GenIB Question Bank' ? '/questions' : 
                cat.name === 'Build Exam or Worksheet' ? '/exam-builder' : 
                `/papers?category=${cat.slug}`,
          iconName: cat.icon, // Store icon name from backend
          description: cat.description,
          count: cat.paper_count,
          isMain: cat.is_main,
        }));
        
        setPaperCategories(mappedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Keep empty array on error - user will see no categories
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const otherLinks = [
    { name: 'Dashboard', href: '/', icon: Home2 },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Profile', href: '/profile', icon: Profile }
  ];

  const isRouteActive = (path: string) => location.pathname === path;
  
  // Check if a category is currently selected
  const isCategoryActive = (category: SidebarCategory) => {
    // Check special routes first
    if (location.pathname === '/questions' && category.name === 'GenIB Question Bank') {
      return true;
    }
    if (location.pathname === '/exam-builder' && category.name === 'Build Exam or Worksheet') {
      return true;
    }
    
    // For /papers route, check the category query parameter
    if (location.pathname === '/papers') {
      const searchParams = new URLSearchParams(location.search);
      const categoryParam = searchParams.get('category');
      
      // Extract slug from category href (e.g., /papers?category=past-year-papers)
      const categorySlug = category.href.split('category=')[1];
      
      return categoryParam === categorySlug;
    }
    
    return false;
  };

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
                const isCurrentRoute = isRouteActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                        ${isCurrentRoute
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon 
                        variant={isCurrentRoute ? "Bold" : "Outline"} 
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
            
            {loading ? (
              // Loading skeleton
              <ul className="space-y-1">
                {[...Array(8)].map((_, index) => (
                  <li key={index} className="animate-pulse">
                    <div className="block p-3 rounded-lg bg-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1">
                {paperCategories.map((category) => {
                  const isSelected = isCategoryActive(category);
                  return (
                    <li key={category.id}>
                      <Link
                        to={category.href}
                        onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                        className={`
                          block p-3 rounded-lg transition-colors duration-200 group
                          ${isSelected
                            ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                            : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          }`}>
                            <DynamicIcon 
                              name={category.iconName}
                              variant={isSelected ? "Bold" : "Outline"} 
                              size={20} 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium truncate ${
                                isSelected ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {category.name}
                              </h4>
                              {category.count > 0 && (
                                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                                  isSelected 
                                    ? 'bg-blue-200 text-blue-800' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {category.count.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-1 ${
                              isSelected ? 'text-blue-600' : 'text-gray-500'
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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className=" bottom-0 w-full p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
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
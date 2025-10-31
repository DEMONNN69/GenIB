import React from 'react';
import { 
  DocumentText, 
  MessageQuestion, 
  Book,
  Teacher,
  Clipboard,
  Star,
  Buildings,
  Setting2
} from 'iconsax-react';

interface PaperCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  count?: number;
  isActive: boolean;
}

interface PaperCategorySidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const PaperCategorySidebar: React.FC<PaperCategorySidebarProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  const categories: PaperCategory[] = [
    {
      id: 'past-year-papers',
      name: 'Past Year Papers',
      icon: DocumentText,
      description: 'Free, PDF, downloadable',
      count: 2450,
      isActive: activeCategory === 'past-year-papers'
    },
    {
      id: 'topical-past-papers',
      name: 'Topical Past Papers',
      icon: Book,
      description: 'Not free, online, not downloadable',
      count: 1890,
      isActive: activeCategory === 'topical-past-papers'
    },
    {
      id: 'mcq-past-papers',
      name: 'MCQ Past Papers',
      icon: MessageQuestion,
      description: 'Not free, online practice',
      count: 980,
      isActive: activeCategory === 'mcq-past-papers'
    },
    {
      id: 'non-topical-past-papers',
      name: 'Non-Topical Past Papers',
      icon: Clipboard,
      description: 'Free, online, not downloadable',
      count: 760,
      isActive: activeCategory === 'non-topical-past-papers'
    },
    {
      id: 'solved-past-papers',
      name: 'Solved Past Papers',
      icon: Teacher,
      description: 'Not free, PDF, downloadable',
      count: 340,
      isActive: activeCategory === 'solved-past-papers'
    },
    {
      id: 'genib-question-bank',
      name: 'GenIB Question Bank',
      icon: Buildings,
      description: 'Free, online, not downloadable',
      count: 5600,
      isActive: activeCategory === 'genib-question-bank'
    },
    {
      id: 'act-sat-ap',
      name: 'ACT, SAT, AP',
      icon: Star,
      description: 'Free, online, not downloadable',
      count: 180,
      isActive: activeCategory === 'act-sat-ap'
    },
    {
      id: 'build-exam-worksheet',
      name: 'Build Exam or Worksheet',
      icon: Setting2,
      description: 'Not free, convert to PDF, printable',
      isActive: activeCategory === 'build-exam-worksheet'
    }
  ];

  return (
    <div className="bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Paper Categories</h2>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 group ${
                  category.isActive
                    ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    category.isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    <Icon variant="Bold" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium truncate ${
                        category.isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {category.name}
                      </h3>
                      {category.count && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          category.isActive 
                            ? 'bg-blue-200 text-blue-800' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      category.isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {category.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaperCategorySidebar;

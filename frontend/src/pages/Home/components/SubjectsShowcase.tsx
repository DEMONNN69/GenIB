import React from 'react';
import { 
  Book,
  Calculator,
  Microscope,
  Flash,
  Global,
  PenTool
} from 'iconsax-react';
import IllustrationPlaceholder from './IllustrationPlaceholder';

const SubjectsShowcase: React.FC = () => {
  const subjects = [
    {
      icon: Calculator,
      name: "Mathematics",
      papers: "450+ Papers",
      questions: "8,500+ Questions",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Microscope,
      name: "Sciences",
      papers: "380+ Papers", 
      questions: "7,200+ Questions",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Book,
      name: "Languages",
      papers: "320+ Papers",
      questions: "6,100+ Questions", 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Global,
      name: "Humanities", 
      papers: "280+ Papers",
      questions: "5,300+ Questions",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: PenTool,
      name: "Arts",
      papers: "180+ Papers",
      questions: "3,400+ Questions",
      color: "from-pink-500 to-pink-600", 
      bgColor: "bg-pink-50"
    },
    {
      icon: Flash,
      name: "Technology",
      papers: "150+ Papers",
      questions: "2,800+ Questions",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Subject Coverage
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access practice materials for all major IB, A-Level, and IGCSE subjects
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Illustration */}
          <div className="order-2 lg:order-1">
            <IllustrationPlaceholder
              title="Subject Learning Hub"
              description="3D isometric illustration of a modern digital library with floating subject icons, open books, mathematical formulas, scientific molecules, and academic symbols arranged in a beautiful composition"
              alt="Digital learning hub with various academic subjects represented"
              className="w-full h-80 lg:h-96"
              imagePath='illustrations\subjects.png'
            />
          </div>

          {/* Right Content - Subjects Grid */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map((subject, index) => {
                const IconComponent = subject.icon;
                return (
                  <div key={index} className={`${subject.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-r ${subject.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent variant="Bold" size={24} className="text-white" />
                    </div>

                    {/* Subject Info */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {subject.name}
                    </h3>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        📄 {subject.papers}
                      </p>
                      <p className="text-sm text-gray-600">
                        ❓ {subject.questions}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">
                Can't find your subject?
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                We're constantly adding new subjects and exam boards. Request yours today!
              </p>
              <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                Request Subject →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Explore All Subjects
            </h3>
            <p className="text-gray-600 mb-6">
              Discover the complete range of subjects and start practicing today
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Browse All Subjects
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubjectsShowcase;
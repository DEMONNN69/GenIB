import React from 'react';
import { 
  SearchNormal, 
  DocumentText, 
  Edit, 
  Chart,
  ArrowRight 
} from 'iconsax-react';
import IllustrationPlaceholder from './IllustrationPlaceholder';

const StudyProcessSection: React.FC = () => {
  const steps = [
    {
      icon: SearchNormal,
      title: "Discover",
      description: "Browse our extensive library of past papers and practice questions",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: DocumentText,
      title: "Practice", 
      description: "Take practice tests and solve questions with detailed explanations",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Edit,
      title: "Create",
      description: "Build custom exams tailored to your specific study needs",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Chart,
      title: "Analyze",
      description: "Track your progress and identify areas for improvement",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Your Path to Academic Excellence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow our proven 4-step study process that has helped thousands of students succeed
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8 items-center mb-16">
          {/* Left Content - Process Steps - Takes up 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}>
                      <IconComponent variant="Bulk" size={18} className="text-white drop-shadow-sm" />
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs font-bold text-gray-400">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block mt-6">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <ArrowRight variant="Bulk" size={14} className="text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Illustration - Takes up 3 columns */}
          <div className="lg:col-span-3 relative">
            <IllustrationPlaceholder
              title="Interactive Study Journey"
              description="3D illustration of a student's study journey showing: a laptop with exam papers floating out, progress charts, study notes, and achievement badges in a dynamic spiral formation"
              alt="Student's interactive learning journey with digital study materials"
              className="w-full h-96 lg:h-[500px] xl:h-[600px]"
              imagePath='illustrations/young boys and young girl jumping.png'
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Your Success Journey?
            </h3>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              Join thousands of students who are already improving their grades with GenIB
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started for Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudyProcessSection;
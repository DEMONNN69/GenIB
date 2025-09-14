import React from 'react';
import { TickCircle } from 'iconsax-react';
import IllustrationPlaceholder from './IllustrationPlaceholder';

const BenefitsSection: React.FC = () => {
  const benefits = [
    "Access to 2,500+ past papers from multiple exam boards",
    "50,000+ practice questions with detailed explanations", 
    "AI-powered personalized study recommendations",
    "Real-time progress tracking and analytics",
    "Mobile-friendly platform for studying anywhere",
    "Regular updates with latest exam papers and mark schemes"
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Why Choose GenIB for Your
                <span className="text-blue-600"> IB Success?</span>
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of students who have improved their grades with our comprehensive study platform.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <TickCircle 
                    variant="Bold" 
                    size={24} 
                    className="text-green-600 mt-0.5 flex-shrink-0" 
                  />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <IllustrationPlaceholder
              title="Students Achieving Success"
              description="3D illustration of diverse students celebrating academic achievements with floating grade certificates, books, and success symbols around them"
              alt="Students celebrating academic success with IB certificates"
              className="w-full h-80 lg:h-96"
              imagePath='public/illustrations/Stocky man showing ok hand sign.png'
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
import React from 'react';
import { Star, QuoteUp } from 'iconsax-react';
import IllustrationPlaceholder from './IllustrationPlaceholder';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "IB Diploma Graduate",
      grade: "45 Points",
      text: "GenIB helped me achieve a perfect score! The past papers and detailed explanations made all the difference.",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      role: "A-Level Student", 
      grade: "A*A*A*",
      text: "The question bank is incredible. I could practice exactly what I needed for each subject.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "IGCSE Student",
      grade: "9 A*s",
      text: "The analytics helped me focus on my weak areas. My grades improved dramatically!",
      rating: 5
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Students Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how GenIB has helped thousands of students achieve their academic goals
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-8 items-center mb-16">
          {/* Left Illustration - Takes up 3 columns */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <IllustrationPlaceholder
              title="Global Student Community"
              description="3D illustration showing students from different countries studying together virtually, with floating screens showing test scores, certificates, and academic achievements"
              alt="International students collaborating and achieving academic success"
              className="w-full h-96 lg:h-[500px] xl:h-[600px]"
              imagePath="illustrations/community.png"
            />
          </div>

          {/* Right Content - Takes up 2 columns */}
          <div className="order-1 lg:order-2 lg:col-span-2 space-y-6">
            <div className="grid gap-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-lg p-4 relative shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                    <QuoteUp 
                      variant="Bulk" 
                      size={12} 
                      className="text-blue-400" 
                    />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Star variant="Bold" size={8} className="text-yellow-600" />
                      </div>
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-gray-700 mb-3 italic text-sm leading-relaxed">"{testimonial.text}"</p>

                  {/* Author Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                      <p className="text-gray-500 text-xs">{testimonial.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {testimonial.grade}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">10,000+</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">94%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">150+</div>
            <div className="text-gray-600">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
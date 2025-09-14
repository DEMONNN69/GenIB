import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Book, MessageQuestion } from 'iconsax-react';
import Stats from './Stats';
import type { Stat } from '../data/homeData';

interface HeroSectionProps {
  stats: Stat[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ stats }) => {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  #1 IB Study Platform
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Master Your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IB Journey
                </span>{' '}
                with GenIB
              </h1>
              
              <p className="text-lg text-gray-600">
                Your comprehensive platform for IB exam preparation. Access thousands of past papers, 
                practice questions, and get personalized insights to excel in your IB diploma.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/papers"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Book variant="Bold" size={20} />
                <span>Start Practicing</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              
              <Link
                to="/questions"
                className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <MessageQuestion variant="Bold" size={20} />
                <span>Explore Questions</span>
              </Link>
            </div>

            <Stats stats={stats} />
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <img 
              src="/illustrations/colleagues discussing team project.png" 
              alt="Students collaborating on IB studies"
              className="w-full h-auto max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
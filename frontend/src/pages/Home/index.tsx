import React from 'react';
import HeroSection from './components/HeroSection';
import FeaturesGrid from './components/FeaturesGrid';
import BenefitsSection from './components/BenefitsSection';
import SubjectsShowcase from './components/SubjectsShowcase';
import StudyProcessSection from './components/StudyProcessSection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import { homeStats, homeFeatures } from './data/homeData';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Container with proper spacing */}
      <div className="max-w-7xl mx-auto">
        <HeroSection stats={homeStats} />
        <FeaturesGrid features={homeFeatures} />
        <BenefitsSection />
        <SubjectsShowcase />
        <StudyProcessSection />
        <TestimonialsSection />
        <FAQSection />
      </div>
    </div>
  );
};

export default Home;
import React from 'react';
import HeroSection from './components/HeroSection';
import FeaturesGrid from './components/FeaturesGrid';
import { homeStats, homeFeatures } from './data/homeData';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection stats={homeStats} />
      <FeaturesGrid features={homeFeatures} />
    </div>
  );
};

export default Home;
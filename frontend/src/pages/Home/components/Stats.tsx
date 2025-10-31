import React from 'react';
import type { Stat } from '../data/homeData';

interface StatsProps {
  stats: Stat[];
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-xl lg:text-2xl font-bold text-gray-900">
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
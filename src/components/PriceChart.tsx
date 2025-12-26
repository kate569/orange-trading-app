import React from 'react';

// Main PriceChart Component
// Historical data is not available - showing placeholder instead of mock data
export const PriceChart: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-slate-500 text-6xl mb-4">📊</div>
        <h3 className="text-slate-400 text-lg font-semibold mb-2">
          Historical Data Unavailable
        </h3>
        <p className="text-slate-500 text-sm max-w-md">
          Real-time historical price data is not currently available. 
          Only live price quotes are being fetched from the API.
        </p>
      </div>
    </div>
  );
};

export default PriceChart;

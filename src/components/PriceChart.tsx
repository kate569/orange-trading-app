import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Helper function to generate 30 days of mock OJ Futures price data
const generateMockPriceData = () => {
  const data = [];
  const today = new Date();
  let basePrice = 3.50; // Starting price around mid-range

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic price movement (random walk with slight upward bias)
    const change = (Math.random() - 0.48) * 0.15; // Slight upward bias
    basePrice = Math.max(3.00, Math.min(4.00, basePrice + change)); // Keep within range
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      price: parseFloat(basePrice.toFixed(2)),
    });
  }
  
  return data;
};

// Custom Tooltip Component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      fullDate: string;
      price: number;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-orange-500 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{data.fullDate}</p>
        <p className="text-orange-400 text-lg font-bold">
          ${data.price.toFixed(2)}
        </p>
        <p className="text-gray-500 text-xs mt-1">OJ Futures</p>
      </div>
    );
  }
  return null;
};

// Main PriceChart Component
export const PriceChart: React.FC = () => {
  const data = generateMockPriceData();

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          
          <YAxis
            domain={[3.0, 4.0]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fb923c', strokeWidth: 1 }} />
          
          <Area
            type="monotone"
            dataKey="price"
            stroke="#fb923c"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

import React, { useState } from "react";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <label className="text-slate-300 text-sm font-medium uppercase tracking-wider">
          {label}
        </label>
        <span
          className="text-xl font-bold"
          style={{ color: "#ff8c00" }}
        >
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-[#ff8c00]
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:shadow-orange-500/30
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-[#ff8c00]
                   [&::-moz-range-thumb]:border-0
                   [&::-moz-range-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export const PredictorDashboard: React.FC = () => {
  const [currentTemp, setCurrentTemp] = useState<number>(32);
  const [hoursBelow28, setHoursBelow28] = useState<number>(0);
  const [currentInventory, setCurrentInventory] = useState<number>(45);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Market Signal Predictor
          </h1>
          <p className="text-slate-400">
            Orange Juice Futures Trading Analysis
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 pb-4 border-b border-slate-700">
            Input Parameters
          </h2>

          <SliderControl
            label="Current Temperature"
            value={currentTemp}
            min={15}
            max={50}
            unit="°F"
            onChange={setCurrentTemp}
          />

          <SliderControl
            label="Hours Below 28°F"
            value={hoursBelow28}
            min={0}
            max={12}
            unit=" hrs"
            onChange={setHoursBelow28}
          />

          <SliderControl
            label="Current Inventory"
            value={currentInventory}
            min={20}
            max={70}
            unit="M"
            onChange={setCurrentInventory}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictorDashboard;

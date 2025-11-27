import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.FC<any>;
  color: string;
  trend?: number[];
  showWarning?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend = [], showWarning }) => {
  return (
    <div className="
      backdrop-blur-xl 
      bg-white/70 
      p-6 
      rounded-2xl 
      shadow-lg 
      border border-white/40 
      hover:shadow-2xl 
      hover:-translate-y-1 
      transition-all 
      duration-300 
      animate-fadeIn
    ">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-600">{title}</p>
          <h3 className="text-4xl font-black text-gray-900 mt-1">{value}</h3>
        </div>

        <div className={`p-4 rounded-xl ${color} shadow-md`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Sparkline trend chart */}
      <div className="mt-4">
        <Sparklines data={trend} margin={6}>
          <SparklinesLine style={{ stroke: "#4f46e5", strokeWidth: 3, fill: "none" }} />
        </Sparklines>
      </div>

      {showWarning && (
        <div className="mt-3 text-red-600 flex items-center text-sm font-medium animate-pulse">
          <AlertTriangle className="w-4 h-4 mr-1" />
          Action Required
        </div>
      )}
    </div>
  );
};

export default StatCard;

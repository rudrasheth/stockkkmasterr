import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type Props = {
  salesTrend: { date: string; value: number }[];
  stockBreakdown: { name: string; value: number }[];
};

export default function AdminAnalyticsPanel({ salesTrend, stockBreakdown }: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg border border-white/30">
      <h3 className="text-lg font-bold">Admin Analytics</h3>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/60 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-600">Sales last 30 days</div>
          <div style={{ height: 150 }} className="mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/60 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-600">Stock breakdown</div>
          <div style={{ height: 150 }} className="mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockBreakdown}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

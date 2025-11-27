import React, { useState, useEffect } from "react";
import { ClipboardList, ArrowUpRight, ArrowDownLeft, RefreshCcw, AlertTriangle } from "lucide-react";

export const HistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Receipt': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'Delivery': return <ArrowUpRight className="w-4 h-4 text-purple-600" />;
      case 'Adjustment': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'Transfer': return <RefreshCcw className="w-4 h-4 text-blue-600" />;
      default: return <ClipboardList className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Ledger</h1>
          <p className="text-gray-500">Complete history of all stock movements.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Reference</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Description</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading history...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No movements recorded yet.</td></tr>
            ) : (
              history.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-600">{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="font-medium text-gray-900">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 text-gray-700">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.status || "Completed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
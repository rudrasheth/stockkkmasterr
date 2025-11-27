import React, { useEffect, useState } from 'react';
import StatCard from '../../components/StatCard';
import AIInsightsCard from '../../components/AIInsightsCard';   // <-- ensure file exists at src/components/AIInsightsCard.tsx
import LiveActivityFeed from '../../components/LiveActivityFeed';
import WarehouseHeatmap from '../../components/WarehouseHeatmap';
import AdminAnalyticsPanel from '../../components/AdminAnalyticsPanel';

import { Package, AlertTriangle, ShoppingCart, Truck, Repeat, XCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  if (token) headers.append('Authorization', `Bearer ${token}`);
  return headers;
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI suggestions + activity + heatmap + analytics data
  const [aiItems, setAiItems] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(true);

  const [heatmap, setHeatmap] = useState<any>({ cols: 6, rows: 4, cells: [] });
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [stockBreakdown, setStockBreakdown] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard-stats', { method: 'GET', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load stats');
      const d = await res.json();
      setStats(d);
    } catch (err) {
      console.error('fetchStats error', err);
      toast.error('Could not load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/predict-inventory', { method: 'GET' });
      if (res.ok) {
        const d = await res.json();
        setAiItems(d.suggestions ?? []);
      } else {
        setAiItems([]);
      }
    } catch (e) {
      console.error('fetchAI error', e);
      setAiItems([]);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const res = await fetch('/api/warehouse/heatmap', { method: 'GET' });
      if (res.ok) {
        const d = await res.json();
        setHeatmap(d);
      }
    } catch (e) {
      console.error('fetchHeatmap error', e);
    }
  };

  const fetchAdminData = async () => {
    // If you have a real endpoint, call it here. For now create demo series
    const demoSales = Array.from({ length: 30 }).map((_, i) => ({
      date: `D${i + 1}`,
      value: Math.round(50 + Math.sin(i / 3) * 20 + Math.random() * 10),
    }));
    setSalesTrend(demoSales);

    setStockBreakdown([
      { name: 'Fast', value: 120 },
      { name: 'Slow', value: 60 },
      { name: 'Stagnant', value: 20 },
    ]);
  };

  useEffect(() => {
    fetchStats();
    fetchAI();
    fetchHeatmap();
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
        <h1 className="text-xl text-gray-600">Loading Dashboard...</h1>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
        <XCircle className="h-6 w-6" />
        <span className="font-bold">Error:</span> Failed to connect to backend statistics.
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 animate-fadeIn">Dashboard Overview</h1>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          color="bg-purple-500"
          trend={stats?.totalProductsTrend ?? [3, 5, 4, 6, 8, 9]}
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStock ?? 0}
          icon={AlertTriangle}
          color="bg-yellow-500"
          trend={stats?.lowStockTrend ?? [1, 1, 0, 1, 0, 0]}
          showWarning={stats?.lowStock > 0}
        />
        <StatCard
          title="Out of Stock"
          value={stats?.outOfStock ?? 0}
          icon={XCircle}
          color="bg-red-500"
          trend={stats?.outOfStockTrend ?? [0, 0, 0, 0, 1]}
          showWarning={stats?.outOfStock > 0}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Pending Receipts"
          value={stats?.pendingReceipts ?? 0}
          icon={ShoppingCart}
          color="bg-green-500"
          trend={stats?.pendingReceiptsTrend ?? [2, 3, 4, 3, 5]}
        />
        <StatCard
          title="Pending Deliveries"
          value={stats?.pendingDeliveries ?? 0}
          icon={Truck}
          color="bg-indigo-500"
          trend={stats?.pendingDeliveriesTrend ?? [5, 4, 3, 4, 5, 6]}
        />
        <StatCard
          title="Active Transfers"
          value={stats?.scheduledTransfers ?? 0}
          icon={Repeat}
          color="bg-teal-500"
          trend={stats?.scheduledTransfersTrend ?? [4, 6, 7, 5, 8, 5]}
        />
      </div>

      {/* AI + Live activity + Heatmap + Admin panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AIInsightsCard items={aiItems} loading={aiLoading} />
          <div className="mt-6">
            <LiveActivityFeed />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <WarehouseHeatmap grid={heatmap.cells ?? []} cols={heatmap.cols ?? 6} />
          <AdminAnalyticsPanel salesTrend={salesTrend} stockBreakdown={stockBreakdown} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

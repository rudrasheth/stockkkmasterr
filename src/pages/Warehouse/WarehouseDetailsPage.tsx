import React, { useState, useEffect } from 'react';
import { Loader2, Zap, Truck, FileText, BarChart, X } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityItem {
    type: 'Delivery' | 'Receipt';
    ref: string;
    date: string;
    items: { productId: string, quantity: number }[]; // Sample detail
}

interface HeatmapItem {
    location: string;
    movement: number;
    status: 'Hot' | 'Normal' | 'Cold';
}

const WarehouseDetailsPage: React.FC = () => {
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [heatmap, setHeatmap] = useState<HeatmapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/recent-activity');
                if (!res.ok) {
                    throw new Error('Failed to fetch activity and heatmap data.');
                }
                const data = await res.json();
                
                setActivity(data.activity || []);
                setHeatmap(data.heatmap || []);

            } catch (err: any) {
                console.error("Warehouse data fetching failed:", err);
                setError("Could not load details. Check backend /api/recent-activity.");
                toast.error("Failed to load warehouse data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-6 text-center text-gray-500"><Loader2 className="animate-spin w-8 h-8 mx-auto" /> Loading Warehouse Data...</div>;
    }
    
    if (error) {
        return <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Warehouse Operations & Health</h1>
            
            {/* Heatmap Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-red-600" />
                    Movement Heatmap Analysis
                </h2>
                <p className="text-gray-600 mb-6">Identifies warehouse zones with the highest recent activity (Hot = High Traffic).</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {heatmap.map((h, index) => (
                        <div 
                            key={index}
                            className="p-4 rounded-xl shadow-md border-t-4"
                            style={{ borderColor: h.status === 'Hot' ? '#DC2626' : h.status === 'Normal' ? '#3B82F6' : '#6B7280' }}
                        >
                            <p className="text-xl font-bold mb-1">{h.location}</p>
                            <p className="text-sm text-gray-500">Activity Level</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div 
                                    className="h-2.5 rounded-full" 
                                    style={{ 
                                        width: `${h.movement}%`, 
                                        backgroundColor: h.status === 'Hot' ? '#DC2626' : h.status === 'Normal' ? '#3B82F6' : '#6B7280' 
                                    }}
                                ></div>
                            </div>
                            <p className="text-right text-lg font-extrabold mt-1" 
                               style={{ color: h.status === 'Hot' ? '#DC2626' : h.status === 'Normal' ? '#3B82F6' : '#6B7280' }}>
                                {h.movement}%
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Activity Detail Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Recent Activity Timeline</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider">
                                <th className="p-4 font-bold">Time</th>
                                <th className="p-4 font-bold">Type</th>
                                <th className="p-4 font-bold">Reference</th>
                                <th className="p-4 font-bold">Items Affected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.map((item, index) => (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="p-4 text-gray-600">{new Date(item.date).toLocaleTimeString()}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.type === 'Delivery' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold">{item.ref}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {item.items.length} unique item(s) processed.
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {activity.length === 0 && <p className="p-4 text-center text-gray-500">No activity records found.</p>}
            </div>
        </div>
    );
};

export default WarehouseDetailsPage;
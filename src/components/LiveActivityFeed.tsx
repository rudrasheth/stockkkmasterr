import React, { useEffect, useState } from 'react';

type Activity = {
  id: string;
  time: string;
  message: string;
  level?: 'info' | 'warn' | 'critical';
};

export default function LiveActivityFeed() {
  const [items, setItems] = useState<Activity[]>([]);
  useEffect(() => {
    const es = new EventSource('/api/stream/activity');

    es.onmessage = (ev) => {
      try {
        const payload: Activity = JSON.parse(ev.data);
        setItems((prev) => [payload, ...prev].slice(0, 50));
      } catch (e) {
        console.error('event parse', e);
      }
    };

    es.onerror = (err) => {
      console.error('EventSource failed:', err);
      es.close();
    };

    return () => es.close();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg border border-white/30">
      <h3 className="text-lg font-bold">Live Activity</h3>
      <div className="mt-3 space-y-2 max-h-56 overflow-auto">
        {items.length === 0 && <div className="text-sm text-gray-600">No recent activity yet.</div>}
        {items.map((it) => (
          <div key={it.id} className={`p-3 rounded-md ${it.level === 'critical' ? 'bg-red-50 border border-red-200' : it.level === 'warn' ? 'bg-yellow-50 border border-yellow-200' : 'bg-white/70 border border-white/30'}`}>
            <div className="flex justify-between items-center">
              <div className="text-sm">{it.message}</div>
              <div className="text-xs text-gray-400">{it.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

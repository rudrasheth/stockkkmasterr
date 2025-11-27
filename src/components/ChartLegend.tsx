import React from 'react';

export default function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-xs text-gray-600">
          <div style={{ width: 12, height: 12, background: it.color }} className="rounded-sm" />
          <div>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

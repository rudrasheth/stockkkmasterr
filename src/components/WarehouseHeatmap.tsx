import React from 'react';

type Cell = { id: string; row: number; col: number; sku?: string; intensity: number };

type Props = {
  grid: Cell[]; // array of cells
  cols: number;
};

const colorFor = (val: number) => {
  // intensity 0..1 -> translate to color
  if (val > 0.75) return 'bg-red-500';
  if (val > 0.5) return 'bg-orange-400';
  if (val > 0.25) return 'bg-yellow-300';
  return 'bg-green-200';
};

export default function WarehouseHeatmap({ grid, cols }: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg border border-white/30">
      <h3 className="text-lg font-bold">Warehouse Heatmap</h3>
      <p className="text-sm text-gray-600 mt-1">Hot = high movement / demand</p>

      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {grid.map((c) => (
          <div key={c.id} title={`${c.sku ?? '—'} • intensity ${c.intensity}`} className={`h-16 rounded-md flex items-center justify-center text-xs font-semibold text-white ${colorFor(c.intensity)} cursor-pointer hover:scale-105 transition`}>
            {c.sku ?? `R${c.row}C${c.col}`}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500">Tip: Red areas need restock soon.</div>
    </div>
  );
}

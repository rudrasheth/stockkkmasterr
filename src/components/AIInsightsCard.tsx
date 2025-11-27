// src/components/AIInsightsCard.tsx
import React from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type ReorderSuggestion = {
  sku: string;
  name: string;
  daysToStockout: number;
  recommendedOrderQty: number;
  confidence: number;
  currentStock?: number;
  vendor?: string;
};

type Props = {
  items: ReorderSuggestion[];
  loading: boolean;
};

const badgeColor = (days: number) => {
  if (days <= 3) return "bg-red-500 text-white";
  if (days <= 10) return "bg-yellow-500 text-black";
  return "bg-green-500 text-white";
};

export default function AIInsightsCard({ items, loading }: Props) {
  const navigate = useNavigate();

  const onCreatePO = (s: ReorderSuggestion) => {
    const q = new URLSearchParams({
      sku: s.sku,
      name: s.name,
      qty: String(s.recommendedOrderQty),
      vendor: s.vendor || "",
    }).toString();

    navigate(`/purchase-order?${q}`);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-lg border border-white/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-indigo-600 text-white">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Reorder Suggestions</h3>
            <p className="text-sm text-gray-600">Predicted stockouts & recommended quantities</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">Confidence AI</div>
      </div>

      <div className="mt-4 space-y-3">
        {loading && <div className="text-sm text-gray-600">Loading suggestions…</div>}

        {!loading && items.length === 0 && (
          <div className="text-sm text-gray-600">No urgent suggestions. Inventory looks healthy.</div>
        )}

        {!loading &&
          items.map((s) => (
            <div
              key={s.sku}
              className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-white/30"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="font-semibold truncate">{s.name}</div>
                  <div className={`px-2 py-0.5 text-xs rounded ${badgeColor(s.daysToStockout)}`}>
                    {s.daysToStockout}d left
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  SKU: {s.sku} · Stock: {s.currentStock ?? "—"} · Vendor: {s.vendor ?? "—"}
                </div>
                <div className="text-sm text-gray-800 mt-2">
                  Order: <span className="font-bold">{s.recommendedOrderQty}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-gray-500">Conf. {Math.round(s.confidence * 100)}%</div>
                <button
                  onClick={() => onCreatePO(s)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                >
                  Create PO <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

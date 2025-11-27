import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const AdjustmentsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [realQuantity, setRealQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    setSelectedProduct(pid);
    const p = products.find(prod => prod.id == pid);
    if (p) {
      setCurrentStock(p.stock);
      setRealQuantity(p.stock);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error("Select a product");

    setIsLoading(true);
    try {
      const res = await fetch('/api/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, realQuantity, reason })
      });

      if (res.ok) {
        toast.success("Stock Adjusted Successfully!");
        setReason("");
        const updatedProducts = products.map(p => 
          p.id == selectedProduct ? { ...p, stock: Number(realQuantity) } : p
        );
        setProducts(updatedProducts);
        setCurrentStock(Number(realQuantity));
      } else {
        toast.error("Failed to adjust stock");
      }
    } catch (err) {
      toast.error("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stock Adjustment</h1>
        <p className="text-gray-500">Correct stock levels based on physical counts.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            {/* ADDED text-gray-900 */}
            <select 
              className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              value={selectedProduct}
              onChange={handleProductChange}
              required
            >
              <option value="">Select Product to Adjust</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Comparison View */}
          {selectedProduct && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">System Stock</p>
                <p className="text-2xl font-mono font-bold text-gray-700">{currentStock}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Difference</p>
                <p className={`text-2xl font-mono font-bold ${realQuantity - currentStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {realQuantity - currentStock > 0 ? "+" : ""}{realQuantity - currentStock}
                </p>
              </div>
            </div>
          )}

          {/* Real Count Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Real Quantity (Physical Count)</label>
            {/* ADDED text-gray-900 */}
            <input 
              type="number" 
              min="0"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg text-gray-900"
              value={realQuantity}
              onChange={(e) => setRealQuantity(Number(e.target.value))}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Adjustment</label>
            {/* ADDED text-gray-900 */}
            <input 
              type="text" 
              placeholder="e.g. Damaged goods, Theft, Counting error"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !selectedProduct}
            className="w-full flex justify-center items-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
               <>
                 <Save className="w-4 h-4 mr-2" /> Apply Adjustment
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
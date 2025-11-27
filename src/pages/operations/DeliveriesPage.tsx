import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Truck, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// NOTE: All MapBox/ReactMapGL dependencies and related code have been REMOVED
// to solve the fitting/layout issue.

export const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Updated state: Latitude/Longitude kept as defaults, but are now optional inputs.
  const [formData, setFormData] = useState({ 
    deliveryNo: '', 
    customer: '', 
    productId: '', 
    quantity: 0,
    latitude: 40.7128, // Default coordinates (New York City)
    longitude: -74.0060, // Default coordinates
  });

  // Removed map state management (viewport, setViewport)

  // Fetch Data on Load
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [delRes, prodRes] = await Promise.all([
        fetch('/api/deliveries'),
        fetch('/api/products')
      ]);
      if (delRes.ok) setDeliveries(await delRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (e) {
      console.error(e);
      toast.error("Failed to load data. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  // Removed handleMapClick as the map is gone.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProduct = products.find(p => p._id === formData.productId);

    // --- Validation ---
    if (formData.quantity <= 0) {
        toast.error("Quantity must be greater than 0.");
        return;
    }
    if (!selectedProduct) {
        toast.error("Please select a product.");
        return;
    }
    if (selectedProduct.stock < formData.quantity) {
        toast.error(`Insufficient stock! Only ${selectedProduct.stock} available.`);
        return;
    }
    // Removed location validation as coordinates are optional/default
    // --- End Validation ---

    try {
      const payload = {
        ...formData,
        // Ensure quantity is sent as a number
        quantity: Number(formData.quantity),
        date: new Date(),
        items: [{ productId: formData.productId, quantity: Number(formData.quantity) }]
      };

      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Delivery Created & Stock Reduced!");
        setShowModal(false);
        // Reset form data
        setFormData({ deliveryNo: '', customer: '', productId: '', quantity: 0, latitude: 40.7128, longitude: -74.0060 });
        fetchData(); // Refresh data
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create delivery.");
      }
    } catch (e) {
      toast.error("Network error. Could not connect to server.");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-gray-900">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Deliveries</h1>
          <p className="text-gray-600 mt-1">Outgoing shipments (Automatically reduces stock)</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" /> 
          New Delivery
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-20 text-gray-400" />
            <p className="text-lg">No deliveries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-bold">Delivery #</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Location</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveries.map((d: any) => (
                  <tr key={d._id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{d.deliveryNo}</td>
                    <td className="p-4 text-gray-800">{d.customer}</td>
                    <td className="p-4 text-gray-600 flex items-center gap-1">
                        <MapPin className='h-4 w-4'/>
                        {d.latitude?.toFixed(2)}, {d.longitude?.toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-600">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                        Shipped
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900 border-b pb-4">Create New Delivery</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Location Coordinates (Simplified Input) */}
              <div className="space-y-2 pb-4">
                <label className="block text-sm font-bold text-gray-800">
                    Delivery Coordinates (Optional)
                    <span className='text-xs font-normal text-gray-500 block'>
                        Latitude: {formData.latitude.toFixed(4)}, Longitude: {formData.longitude.toFixed(4)}
                    </span>
                </label>
                {/* You can add simple inputs here if manual coordinate entry is needed: */}
                 {/* <div className="flex gap-4">
                    <input type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({...formData, latitude: Number(e.target.value)})} className="w-full p-3 border-2 rounded-lg" />
                    <input type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({...formData, longitude: Number(e.target.value)})} className="w-full p-3 border-2 rounded-lg" />
                 </div>
                 */}
              </div>


              {/* Delivery Number & Customer */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Delivery Number</label>
                <input 
                  required 
                  placeholder="e.g. DEL-2024-001" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white" 
                  value={formData.deliveryNo}
                  onChange={e => setFormData({...formData, deliveryNo: e.target.value})} 
                />
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Customer Name</label>
                <input 
                  required 
                  placeholder="Enter Client Name" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white" 
                  value={formData.customer}
                  onChange={e => setFormData({...formData, customer: e.target.value})} 
                />
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Select Product to Ship</label>
                <select 
                  required 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white appearance-none"
                  value={formData.productId}
                  onChange={e => setFormData({...formData, productId: e.target.value})}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id} className="text-gray-900">
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Quantity to Remove</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  placeholder="0" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white" 
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} 
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
                >
                  Confirm & Ship
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
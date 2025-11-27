import React, { useState, useEffect } from 'react';
import { Plus, Loader2, MapPin, Warehouse } from 'lucide-react';
import { toast } from 'sonner';

// --- REMOVED: All Mapbox, ReactMapGL, and Marker imports ---
// --- REMOVED: MAPBOX_TOKEN constant ---

export const LocationsPage = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Updated state: latitude and longitude REMOVED
  const [formData, setFormData] = useState({ 
    name: '', 
    type: 'Warehouse', 
    capacity: '', 
    // latitude: 40.7128, <--- REMOVED
    // longitude: -74.0060, <--- REMOVED
  });

  // REMOVED: Map viewport state and handleMapClick function

  // Fetch Data on Load
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/locations');
      if (res.ok) setLocations(await res.json());
    } catch (e) {
      console.error(e);
      toast.error("Failed to load locations data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Location ${formData.name} added!`);
        setShowModal(false);
        setFormData({ name: '', type: 'Warehouse', capacity: '' });
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to add location.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen text-gray-900">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage physical storage locations.</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" /> 
          New Location
        </button>
      </div>

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-12 flex justify-center col-span-3"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
        ) : locations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 col-span-3">
            <Warehouse className="h-12 w-12 mx-auto mb-3 opacity-20 text-gray-400" />
            <p className="text-lg">No locations found. Add one now!</p>
          </div>
        ) : (
          locations.map((l: any) => (
            <div key={l._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className='h-5 w-5 text-blue-600'/> {l.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{l.type} - Max: {l.capacity}</p>
                {/* Removed coordinates rendering, as they are no longer required/expected */}
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900 border-b pb-4">Add New Location</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Removed Map Section completely */}
              
              {/* Location Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Location Name</label>
                  <input 
                    required 
                    placeholder="e.g., Main Warehouse A" 
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Type</label>
                  <select 
                    required 
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white appearance-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Warehouse">Warehouse</option>
                    <option value="Store">Retail Store</option>
                    <option value="Temporary">Temporary Site</option>
                  </select>
                </div>
              </div>
              
              {/* Capacity */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Capacity / Size</label>
                <input 
                  required 
                  placeholder="e.g., 5000 sq ft or 20 Pallets" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white" 
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: e.target.value})} 
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
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
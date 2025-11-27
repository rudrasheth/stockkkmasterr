import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Repeat, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const TransfersPage = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({ 
    reference: '', 
    fromLocation: '', 
    toLocation: '', 
    status: 'Done' 
  });

  // Fetch Data on Load
  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [transfersRes, locationsRes] = await Promise.all([
        fetch('/api/transfers'),
        fetch('/api/locations')
      ]);
      
      if (transfersRes.ok) setTransfers(await transfersRes.json());
      if (locationsRes.ok) setLocations(await locationsRes.json());
      
    } catch (e) {
      console.error(e);
      toast.error("Failed to load transfer data.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.fromLocation === formData.toLocation) {
        toast.error("Source and destination must be different.");
        return;
    }

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`Transfer ${formData.reference} recorded!`);
        setShowModal(false);
        setFormData({ reference: '', fromLocation: '', toLocation: '', status: 'Done' });
        fetchData(); // Refresh list
      } else {
        toast.error("Failed to create transfer.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4 border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600 mt-1">Move inventory between locations.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" /> 
          New Transfer
        </button>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Repeat className="h-12 w-12 mx-auto mb-3 opacity-20 text-gray-400" />
            <p className="text-lg">No transfers recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-bold">Reference</th>
                  <th className="p-4 font-bold">Source</th>
                  <th className="p-4 font-bold">Destination</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transfers.map((t: any) => (
                  <tr key={t._id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{t.reference}</td>
                    <td className="p-4 text-gray-800 flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-500"/> {t.fromLocation}</td>
                    <td className="p-4 text-gray-800 flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-500"/> {t.toLocation}</td>
                    <td className="p-4 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                        {t.status}
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
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900 border-b pb-4">New Stock Transfer</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Reference Number</label>
                <input 
                  required 
                  placeholder="e.g. TRF-2024-005" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white" 
                  value={formData.reference}
                  onChange={e => setFormData({...formData, reference: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Source Location</label>
                <select 
                  required 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white"
                  value={formData.fromLocation}
                  onChange={e => setFormData({...formData, fromLocation: e.target.value})}
                >
                  <option value="">-- Select Source --</option>
                  {locations.map(l => (
                    <option key={l._id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Destination Location</label>
                <select 
                  required 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 bg-white"
                  value={formData.toLocation}
                  onChange={e => setFormData({...formData, toLocation: e.target.value})}
                >
                  <option value="">-- Select Destination --</option>
                  {locations.map(l => (
                    <option key={l._id} value={l.name}>{l.name}</option>
                  ))}
                </select>
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
                  Record Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
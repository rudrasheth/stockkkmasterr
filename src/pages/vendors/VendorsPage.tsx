import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const VendorsPage = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      if (res.ok) setVendors(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Vendor added");
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
        fetchVendors();
      } else toast.error("Failed to add vendor");
    } catch (e) { toast.error("Network error"); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-900">Vendors</h1><p className="text-gray-500">Manage suppliers</p></div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-blue-700"><Plus /> Add Vendor</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <Loader2 className="animate-spin h-8 w-8 text-blue-600" /> : vendors.map((v: any) => (
          <div key={v._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full"><Building2 className="h-6 w-6 text-blue-600" /></div>
              <div><h3 className="font-semibold text-lg text-gray-900">{v.name}</h3><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span></div>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3"><Mail className="h-4 w-4" /> {v.email}</div>
              <div className="flex gap-3"><Phone className="h-4 w-4" /> {v.phone}</div>
              <div className="flex gap-3"><MapPin className="h-4 w-4" /> {v.address}</div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add Vendor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input required placeholder="Name" className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required placeholder="Email" type="email" className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input required placeholder="Phone" className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input required placeholder="Address" className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
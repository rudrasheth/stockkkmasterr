import React from "react";
import { Save, Bell, Shield, Database } from "lucide-react";
import { toast } from "sonner";

export const SettingsPage = () => {
  const handleSave = () => {
    toast.success("Settings Saved Successfully!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure application preferences</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Database className="w-6 h-6"/></div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">General Settings</h3>
            <p className="text-sm text-gray-500">Basic application configuration</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
             <input type="text" defaultValue="StockMaster Corp" className="w-full p-3 border rounded-lg text-gray-900"/>
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
             <select className="w-full p-3 border rounded-lg text-gray-900 bg-white">
               <option>$ (USD)</option>
               <option>€ (EUR)</option>
               <option>₹ (INR)</option>
             </select>
           </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Bell className="w-6 h-6"/></div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">Manage alerts and emails</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
           <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
             <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600"/>
             <span className="text-gray-900 font-medium">Email on Low Stock</span>
           </label>
           <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
             <input type="checkbox" className="w-5 h-5 text-blue-600"/>
             <span className="text-gray-900 font-medium">Email on New Receipt</span>
           </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>
    </div>
  );
};
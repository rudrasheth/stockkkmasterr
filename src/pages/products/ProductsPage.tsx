import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Package, Search, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Define the interface for a Product, based on your backend schema
interface Product {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  reorderPoint?: number; // Optional based on schema default
}

// Initial state for the new product form
const initialFormState = {
  name: '',
  category: '',
  unit: 'Pieces',
  price: 0,
  initialStock: 0,
  reorderPoint: 10,
};

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fetch Data ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (e) {
      toast.error("Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // Basic Validation
    if (formData.price <= 0 || formData.initialStock < 0) {
      toast.error("Price must be greater than zero, and stock cannot be negative.");
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        initialStock: Number(formData.initialStock),
        reorderPoint: Number(formData.reorderPoint),
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Product "${formData.name}" added successfully!`);
        setFormData(initialFormState);
        setShowModal(false);
        fetchProducts(); // Refresh the list
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add product.");
      }
    } catch (e) {
      toast.error("Network error. Could not connect to server.");
    } finally {
      setFormLoading(false);
    }
  };

  // --- Utility Functions ---

  const getStatus = (stock: number, reorderPoint: number = 10) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Out of Stock') return 'bg-red-100 text-red-700 border-red-300';
    if (status === 'Low Stock') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  // --- Filtering ---
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-gray-900">
      
      {/* Header and Controls */}
      <div className="flex justify-between items-center border-b pb-4 border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setFormData(initialFormState); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" /> 
          Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or category..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <X 
            className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" 
            onClick={() => setSearchTerm('')}
          />
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-20 text-gray-400" />
            <p className="text-lg">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Unit Price</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Reorder Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => {
                  const status = getStatus(product.stock, product.reorderPoint);
                  return (
                    <tr key={product._id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{product.name}</td>
                      <td className="p-4 text-gray-800">{product.category}</td>
                      <td className="p-4 text-gray-800">₹{product.price.toFixed(2)}</td>
                      <td className="p-4 text-gray-800">{product.stock} {product.unit}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{product.reorderPoint || 10}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modal Form --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900 border-b pb-4">Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Product Name</label>
                <input 
                  required 
                  placeholder="e.g., iPhone 15" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Category</label>
                <input 
                  required 
                  placeholder="e.g., Electronics, Tyres, Food" 
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                />
              </div>

              {/* Price and Stock (Inline) */}
              <div className="flex gap-4">
                
                {/* Unit Price */}
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-800 mb-1">Unit Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                    <input 
                      required 
                      type="number" 
                      min="0.01" 
                      step="0.01"
                      placeholder="0.00" 
                      className="w-full p-3 pl-8 border-2 border-gray-300 rounded-lg text-gray-900" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                {/* Initial Stock */}
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-800 mb-1">Initial Stock</label>
                  <input 
                    required 
                    type="number" 
                    min="0"
                    placeholder="0" 
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900" 
                    value={formData.initialStock}
                    onChange={e => setFormData({...formData, initialStock: Number(e.target.value)})} 
                  />
                </div>
              </div>
              
              {/* Unit and Reorder Point (Inline) */}
              <div className="flex gap-4">
                  {/* Unit */}
                  <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-800 mb-1">Unit Type</label>
                      <select 
                          required 
                          className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 appearance-none"
                          value={formData.unit}
                          onChange={e => setFormData({...formData, unit: e.target.value})}
                      >
                          <option value="Pieces">Pieces</option>
                          <option value="Kg">Kg</option>
                          <option value="Liters">Liters</option>
                          <option value="Meters">Meters</option>
                          <option value="Box">Box</option>
                      </select>
                  </div>
                  
                  {/* Reorder Point */}
                  <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-800 mb-1">Reorder Point</label>
                      <input 
                          type="number" 
                          min="0"
                          placeholder="10" 
                          className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900" 
                          value={formData.reorderPoint}
                          onChange={e => setFormData({...formData, reorderPoint: Number(e.target.value)})} 
                      />
                  </div>
              </div>


              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
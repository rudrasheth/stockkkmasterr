import React, { useState, useEffect } from 'react';
import { Plus, Loader2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf'; // You need to install this library: npm install jspdf

// Define interfaces based on your backend schema
interface ReceiptItem {
    productId: string;
    quantity: number;
    cost: number; // Cost per item
}

interface Receipt {
    _id: string;
    receiptNo: string;
    vendorId: string;
    date: string;
    status: string;
    items: ReceiptItem[];
}

// NOTE: Mock data for vendors (replace with actual fetch if needed)
const mockVendors = [
    { _id: 'v1', name: 'Vendor A' },
    { _id: 'v2', name: 'Vendor B' },
    { _id: 'v3', name: 'Vendor C' },
];

// Initial state for the new receipt form
const initialReceiptFormState = { 
    receiptNo: '', 
    vendorId: '', 
    items: [{ productId: '', quantity: 0, cost: 0 }]
};

export const ReceiptsPage = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [products, setProducts] = useState<any[]>([]); // Used for product name lookup
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newReceiptForm, setNewReceiptForm] = useState(initialReceiptFormState);

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            const [recRes, prodRes] = await Promise.all([
                fetch('/api/receipts'),
                fetch('/api/products')
            ]);
            
            const [receiptsData, productsData] = await Promise.all([
                recRes.json(),
                prodRes.json()
            ]);

            setReceipts(receiptsData);
            setProducts(productsData);
        } catch (e) {
            toast.error("Failed to load receipts or product data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- PDF Generation Logic (FINAL ERROR-FREE SYNTAX) ---
    const downloadReceiptPDF = (receipt: Receipt) => {
        const doc = new jsPDF();
        let y = 10;
        const lineSpacing = 8;
        let totalCost = 0;

        doc.setFontSize(18);
        doc.text("StockMaster Receipt", 10, y);
        y += lineSpacing + 2;

        doc.setFontSize(12);
        doc.text(`Receipt #: ${receipt.receiptNo}`, 10, y);
        y += lineSpacing;
        doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, 10, y);
        y += lineSpacing;
        
        const vendor = mockVendors.find(v => v._id === receipt.vendorId);
        doc.text(`Vendor: ${vendor?.name || 'Unknown Vendor'}`, 10, y);
        y += lineSpacing * 2; 

        // Table Header
        doc.setFontSize(10);
        doc.setFont(doc.getFont().fontName, 'bold'); // FIX: Set font style to 'bold'
        doc.text("Product Name", 10, y);
        doc.text("Qty", 90, y);
        doc.text("Cost/Unit", 120, y);
        doc.text("Line Total", 170, y);
        doc.setFont(doc.getFont().fontName, 'normal'); // FIX: Set font style back to 'normal'
        y += lineSpacing;

        // Table Rows
        receipt.items.forEach(item => {
            const product = products.find(p => p._id === item.productId);
            const lineTotal = item.quantity * item.cost;
            totalCost += lineTotal;
            
            doc.text(product?.name || 'Product ID: ' + item.productId, 10, y);
            doc.text(String(item.quantity), 90, y);
            doc.text(`₹${item.cost.toFixed(2)}`, 120, y);
            doc.text(`₹${lineTotal.toFixed(2)}`, 170, y);
            y += lineSpacing; 
        });
        
        y += lineSpacing;
        doc.line(10, y, 200, y); // Separator line
        y += lineSpacing;
        
        doc.setFont(doc.getFont().fontName, 'bold'); // FIX: Set font style to 'bold' for total
        doc.text(`TOTAL AMOUNT: ₹${totalCost.toFixed(2)}`, 200, y, { align: 'right' });

        doc.save(`Receipt_${receipt.receiptNo}.pdf`);
        toast.success(`PDF for Receipt ${receipt.receiptNo} generated.`);
    };

    // --- Form Handlers (for new receipt creation) ---
    const handleNewReceiptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic Validation
        if (newReceiptForm.items.length === 0 || newReceiptForm.items.some(item => item.quantity <= 0 || item.cost <= 0)) {
            toast.error("Please add valid items with positive quantity and cost.");
            return;
        }

        try {
            const res = await fetch('/api/receipts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReceiptForm),
            });

            if (res.ok) {
                toast.success(`Receipt ${newReceiptForm.receiptNo} created and stock updated!`);
                setShowModal(false);
                setNewReceiptForm(initialReceiptFormState);
                fetchData(); // Refresh data
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to create receipt.");
            }
        } catch (e) {
            toast.error("Network error.");
        }
    };


    // Helper functions
    const getVendorName = (id: string) => mockVendors.find(v => v._id === id)?.name || 'Unknown Vendor';


    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-gray-900">
            
            {/* Header and Controls */}
            <div className="flex justify-between items-center border-b pb-4 border-gray-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Receipts</h1>
                    <p className="text-gray-600 mt-1">Record incoming stock (Automatically increases stock)</p>
                </div>
                <button 
                    onClick={() => { setShowModal(true); }} 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
                >
                    <Plus className="h-5 w-5" /> 
                    New Receipt
                </button>
            </div>

            {/* Receipts Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
                ) : receipts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-20 text-gray-400" />
                        <p className="text-lg">No receipts found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4 font-bold">Receipt #</th>
                                    <th className="p-4 font-bold">Vendor</th>
                                    <th className="p-4 font-bold">Date</th>
                                    <th className="p-4 font-bold">Items</th>
                                    <th className="p-4 font-bold">Total Cost</th>
                                    <th className="p-4 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {receipts.map((r: Receipt) => (
                                    <tr key={r._id} className="hover:bg-green-50 transition-colors">
                                        <td className="p-4 font-bold text-gray-900">{r.receiptNo}</td>
                                        <td className="p-4 text-gray-800">{getVendorName(r.vendorId)}</td>
                                        <td className="p-4 text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-600">{r.items.length} items</td>
                                        <td className="p-4 font-bold text-gray-900">
                                            ₹{r.items.reduce((sum, item) => sum + (item.quantity * item.cost), 0).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => downloadReceiptPDF(r)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                                                title="Download as PDF"
                                            >
                                                <Download className="h-4 w-4" /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- Modal Form: Add New Receipt (Simplified) --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        
                        <h2 className="text-2xl font-extrabold mb-6 text-gray-900 border-b pb-4">Record New Receipt</h2>
                        
                        <form onSubmit={handleNewReceiptSubmit} className="space-y-4">
                            
                            {/* Receipt Details */}
                            <input 
                                required 
                                placeholder="Receipt Number" 
                                className="w-full p-3 border-2 rounded-lg" 
                                value={newReceiptForm.receiptNo}
                                onChange={e => setNewReceiptForm({...newReceiptForm, receiptNo: e.target.value})} 
                            />
                            <select 
                                required 
                                className="w-full p-3 border-2 rounded-lg appearance-none"
                                value={newReceiptForm.vendorId}
                                onChange={e => setNewReceiptForm({...newReceiptForm, vendorId: e.target.value})}
                            >
                                <option value="">-- Select Vendor --</option>
                                {mockVendors.map(v => (
                                    <option key={v._id} value={v._id}>{v.name}</option>
                                ))}
                            </select>

                            <h3 className="text-lg font-bold pt-4 border-t mt-4">Items Received</h3>
                            
                            {/* Item Inputs (Simplified: assumes only one item for brevity) */}
                            {newReceiptForm.items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                                    <select 
                                        required 
                                        className="flex-2 p-3 border rounded-lg appearance-none"
                                        value={item.productId}
                                        onChange={e => {
                                            const newItems = [...newReceiptForm.items];
                                            newItems[index].productId = e.target.value;
                                            setNewReceiptForm({...newReceiptForm, items: newItems});
                                        }}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <input 
                                        required 
                                        type="number" min="1" 
                                        placeholder="Qty" 
                                        className="flex-1 p-3 border rounded-lg"
                                        value={item.quantity}
                                        onChange={e => {
                                            const newItems = [...newReceiptForm.items];
                                            newItems[index].quantity = Number(e.target.value);
                                            setNewReceiptForm({...newReceiptForm, items: newItems});
                                        }} 
                                    />
                                    <input 
                                        required 
                                        type="number" min="0.01" step="0.01" 
                                        placeholder="Cost" 
                                        className="flex-1 p-3 border rounded-lg"
                                        value={item.cost}
                                        onChange={e => {
                                            const newItems = [...newReceiptForm.items];
                                            newItems[index].cost = Number(e.target.value);
                                            setNewReceiptForm({...newReceiptForm, items: newItems});
                                        }} 
                                    />
                                </div>
                            ))}

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
                                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-md"
                                >
                                    Record Receipt & Update Stock
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
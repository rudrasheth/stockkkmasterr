import React from 'react';
import { Toaster } from 'sonner'; 
import { useNavigate, Link } from 'react-router-dom';
import { 
    Package, Building2, MapPin, ShoppingCart, Truck, Repeat, History, HelpCircle, LogOut 
} from 'lucide-react'; 
// --- Removed: import type { Icon as LucideIcon } from 'lucide-react'; 

// Define the Sidebar Navigation Items
// NOTE: We define the array type based on a generic React Function Component (React.FC<any>)
const navItems: { name: string; path: string; icon: React.FC<any> | null; type?: string; label?: string; }[] = [
    
    // FIX: Dashboard is now defined, using 'Package' as a temporary icon placeholder
    { name: "Dashboard", path: "/dashboard", icon: Package }, 
    
    { name: "Products", path: "/products", icon: Package },
    { name: "Vendors", path: "/vendors", icon: Building2 },
    { name: "Locations", path: "/locations", icon: MapPin },
    
    // Divider item properties
    { name: "Divider", path: "", icon: null, type: "divider", label: "OPERATIONS" }, 
    
    { name: "Receipts", path: "/receipts", icon: ShoppingCart },
    { name: "Deliveries", path: "/deliveries", icon: Truck },
    { name: "Transfers", path: "/transfers", icon: Repeat },
    { name: "History", path: "/history", icon: History },
];


interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login'); 
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            
            <aside className="w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col z-20">
                <div className="p-4 text-2xl font-extrabold text-blue-600 border-b border-gray-100">
                    StockMaster
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <div key={index}>
                        {item.type === "divider" ? (
                            <div className="pt-4 pb-2 text-xs font-semibold uppercase text-gray-500">
                                {item.label}
                            </div>
                        ) : (
                            <Link 
                                key={item.name}
                                to={item.path}
                                className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                            >
                                {item.icon && React.createElement(item.icon as React.FC<any>, { className: "h-5 w-5" })} 
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                    <Link 
                        to="/help"
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                        <HelpCircle className="h-5 w-5" />
                        <span className="font-medium">Help</span>
                    </Link>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto relative">
                <div className="p-6">
                    {children}
                </div>
            </main>

            <Toaster position="top-right" richColors />
        </div>
    );
};
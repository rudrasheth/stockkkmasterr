// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';

// --- Layout and Component Imports (FINAL NAMED EXPORTS FIX) ---

// Layout (FIXED: Changed to NAMED IMPORT)
import { Layout } from './layout/Layout.tsx'; 

// 1. Auth Pages (FIXED: NAMED IMPORTS)
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { SignUpPage } from './pages/auth/SignUpPage.tsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.tsx';

// 2. Main Dashboard & Inventory Pages (FIXED: NAMED IMPORTS)
import { DashboardPage } from './pages/dashboard/DashboardPage.tsx'; 
import { ProductsPage } from './pages/products/ProductsPage.tsx'; 
import { VendorsPage } from './pages/vendors/VendorsPage.tsx';
import { LocationsPage } from './pages/locations/LocationsPage.tsx';

// 3. Operation Pages (FIXED: NAMED IMPORTS)
import { ReceiptsPage } from './pages/operations/ReceiptsPage.tsx';
import { DeliveriesPage } from './pages/operations/DeliveriesPage.tsx';
import { TransfersPage } from './pages/operations/TransfersPage.tsx';
import { AdjustmentsPage } from './pages/operations/AdjustmentsPage.tsx';
import { HistoryPage } from './pages/operations/HistoryPage.tsx';

// 4. New Functional Pages (FIXED: NAMED IMPORTS)
import  AIChatPage  from './pages/AI/AIChatPage.tsx'; 
import  WarehouseDetailsPage  from './pages/Warehouse/WarehouseDetailsPage.tsx'; 


// --- Helper Component for Protected Routes (FIXED Usage) ---
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Layout wraps the Outlet so every protected child shares the layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected parent route — children are nested and use relative paths (no leading '/') */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Inventory & Operations (relative paths) */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="adjustments" element={<AdjustmentsPage />} />
          <Route path="history" element={<HistoryPage />} />

          {/* New functional pages */}
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="warehouse-details" element={<WarehouseDetailsPage />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
              <h1>404 | Page Not Found</h1>
              <p>
                Go back to <Link to="/dashboard" className="text-blue-400">Dashboard</Link>
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
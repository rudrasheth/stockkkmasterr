import React from 'react';

export const HelpPage = () => {
  // We use a simple layout that is guaranteed to render
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-extrabold text-blue-600">Help & Support</h1>
        <p className="mt-4 text-gray-700">
          Thank you for using StockMaster. For technical support, please contact your system administrator.
        </p>
        <p className="mt-2 text-gray-500 text-sm">
          (This page is accessible to both logged-in and logged-out users.)
        </p>
      </div>
    </div>
  );
};
// src/App.jsx
import React from 'react';
import AppRoutes from './routes';
import { Users } from 'lucide-react';
import './index.css';

const App = () => {
  return (
    <div className="min-h-screen w-full"> {/* Ensure full width */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">HR Test Platform</span>
          </div>
        </div>
      </nav>
      <div className="w-full"> {/* Ensure routes take full width */}
        <AppRoutes />
      </div>
    </div>
  );
};

export default App;
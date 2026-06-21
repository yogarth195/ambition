import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <p className="text-[80px] font-bold text-black leading-none select-none">404</p>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-gray-900">Page not found</h1>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            This page doesn't exist.
          </p>
        </div>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>
      </div>
    </div>
  );
};

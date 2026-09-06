import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductionEntryPage } from '@/pages/ProductionEntryPage';
import { TrimmerPage } from '@/pages/TrimmerPage';
import { BuffingPage } from '@/pages/BuffingPage';
import { RepairPage } from '@/pages/RepairPage';
import { PackedPage } from '@/pages/PackedPage';
import { QuantityPage } from '@/pages/QuantityPage';
import { SalePage } from '@/pages/SalePage';
import { LabourPage } from '@/pages/LabourPage';
import { MiscPage } from '@/pages/MiscPage';
import { HelpPage } from '@/pages/HelpPage';

const App: React.FC = () => (
  <AuthProvider>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="production" element={<ProductionEntryPage />} />
          <Route path="trimmer" element={<TrimmerPage />} />
          <Route path="buffing" element={<BuffingPage />} />
          <Route path="repair" element={<RepairPage />} />
          <Route path="packed" element={<PackedPage />} />
          <Route path="quantity" element={<QuantityPage />} />
          <Route path="sale" element={<SalePage />} />
          <Route path="labour" element={<LabourPage />} />
          <Route path="misc" element={<MiscPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;

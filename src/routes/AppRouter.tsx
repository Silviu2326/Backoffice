import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import Login from '../components/Login';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#2C2C2C] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F76934] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
          {routes.map((route) => {
              // Convert absolute path /admin/xyz to relative path xyz
              const relativePath = route.path.replace(/^\/admin\//, '');
              // Handle the case where the path is exactly /admin (if any) or map correctly
              return (
                  <Route
                      key={route.path}
                      path={relativePath}
                      element={<route.component />}
                  />
              );
          })}
          {/* Fallback for /admin/ */}
          <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;

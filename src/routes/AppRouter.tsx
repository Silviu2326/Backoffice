import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import Login from '../components/Login';
import DashboardLayout from '../layouts/DashboardLayout';

// Mock Auth Check
const isAuthenticated = () => {
  // TODO: Integrate with real auth context
  // For now we check if a flag exists in localStorage, or default to true for development if needed
  // Uncomment the next line to enforce auth
  // return localStorage.getItem('isAuthenticated') === 'true'; 
  return true; // Temporarily allow access for dev
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
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

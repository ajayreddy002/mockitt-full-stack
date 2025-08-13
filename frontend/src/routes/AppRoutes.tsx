// frontend/src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routeConfig';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { useAuth } from '../store';
import { useRole } from '../hooks/useRole';
import { AppLayout } from '../layout/AppLayout';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentRole } = useRole();

  return (
    <Routes>
      {routes.map((route) => {
        const { 
          path, 
          component: Component, 
          isProtected, 
          requiresDashboardLayout,
          adminOnly,
          requiredRole 
        } = route;

        if (isProtected) {
          return (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute requiredRole={requiredRole} adminOnly={adminOnly}>
                  {requiresDashboardLayout ? (
                    <AppLayout> {/* ✅ Single layout for all protected routes */}
                      <Component />
                    </AppLayout>
                  ) : (
                    <Component />
                  )}
                </ProtectedRoute>
              }
            />
          );
        } else {
          return (
            <Route
              key={path}
              path={path}
              element={
                <PublicRoute>
                  <Component />
                </PublicRoute>
              }
            />
          );
        }
      })}

      {/* Default route with role-based redirect */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? currentRole === 'ADMIN' 
                  ? "/admin" 
                  : "/dashboard"
                : "/login"
            } 
            replace 
          />
        } 
      />

      {/* 404 route */}
      <Route 
        path="*" 
        element={
          <AppLayout>
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </AppLayout>
        } 
      />
    </Routes>
  );
};

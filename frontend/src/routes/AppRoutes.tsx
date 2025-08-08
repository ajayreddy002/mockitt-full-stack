import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routeConfig';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { DashboardLayout } from '../layout/DashboardLayout';
import { useAuth } from '../store';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {routes.map((route) => {
        const { path, component: Component, isProtected, requiresDashboardLayout } = route;

        if (isProtected) {
          // Protected routes
          if (requiresDashboardLayout) {
            // Protected routes with dashboard layout
            return (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Component />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            );
          } else {
            // Protected routes without dashboard layout
            return (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                }
              />
            );
          }
        } else {
          // Public routes (redirect if authenticated)
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

      {/* Default route */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />

      {/* 404 route */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <a 
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go Home
              </a>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

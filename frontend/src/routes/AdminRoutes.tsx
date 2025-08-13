// frontend/src/routes/AdminRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { LoadingSpinner } from '../components/common/LoadingStates';
import { useAuth } from '../store';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { isAdmin } = useRole();

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated } = useAuth();
  
  return !isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

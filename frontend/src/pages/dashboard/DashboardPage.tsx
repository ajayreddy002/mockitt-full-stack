import React from 'react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';
import { useRole } from '../../hooks/useRole';
import { AdminDashboard } from '../admin/AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useRole();
  if (isAdmin()) {
    return <AdminDashboard />;
  }
  return <DashboardOverview />;
};

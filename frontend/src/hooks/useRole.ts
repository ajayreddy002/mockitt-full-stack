// frontend/src/hooks/useRole.ts

import { useAuth } from "../store";

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isStudent = () => {
    return user?.role === 'STUDENT';
  };

  const isMentor = () => {
    return user?.role === 'MENTOR';
  };

  return {
    hasRole,
    isAdmin,
    isStudent,
    isMentor,
    currentRole: user?.role,
  };
};

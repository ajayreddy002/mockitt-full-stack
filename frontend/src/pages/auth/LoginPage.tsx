import React from 'react';
import { AuthLayout } from '../../layout/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Sign in to your Mockitt account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

import React from 'react';
import { AuthLayout } from '../../layout/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Join Mockitt"
      subtitle="Start your AI-powered career journey"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

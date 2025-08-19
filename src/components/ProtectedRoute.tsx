import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated
}) => {
  const location = useLocation();

  if (!isAuthenticated) {
    // Перенаправляем на страницу логина, сохраняя текущий путь
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

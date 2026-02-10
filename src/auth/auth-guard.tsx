import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

const useAuth = () => {
  const token = localStorage.getItem('accessToken');
  return { isAuthenticated: !!token };
};

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

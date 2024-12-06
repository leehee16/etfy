import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('currentUser') !== null;

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
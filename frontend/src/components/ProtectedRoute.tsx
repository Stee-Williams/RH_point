import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getHomePath, type UserRole } from '../types/auth';
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}
const CHANGE_PASSWORD_PATH = '/changer-mot-de-passe';
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-sm text-gray-500">
        Chargement...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }
  if (user?.doitChangerMotDePasse && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  return <>{children}</>;
}

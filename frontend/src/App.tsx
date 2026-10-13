import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { PasswordRecoveryPage } from './pages/auth/PasswordRecoveryPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { PointagePage } from './pages/employe/PointagePage';
import { CongesPage } from './pages/employe/CongesPage';
import { PresencesPage } from './pages/chef-service/PresencesPage';
import { ValidationCongesPage } from './pages/chef-service/ValidationCongesPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EmployesPage } from './pages/admin-rh/EmployesPage';
import { RapportsPage } from './pages/admin-rh/RapportsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { useAuth } from './hooks/useAuth';
import { getHomePath } from './types/auth';
function DefaultRoute() {
  const { user } = useAuth();
  return <Navigate to={user ? getHomePath(user.role) : '/connexion'} replace />;
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Route publique */}
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/mot-de-passe-oublie" element={<PasswordRecoveryPage />} />
            <Route path="/confidentialite" element={<PrivacyPage />} />
            {/* Routes protégées avec le Layout partagé */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/changer-mot-de-passe" element={<ChangePasswordPage />} />
              <Route path="/pointage" element={<PointagePage />} />
              <Route path="/mes-conges" element={<CongesPage />} />
              {/* Espace Chef de service / Admin RH */}
              <Route
                path="/presences"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CHEF_SERVICE', 'ROLE_ADMIN_RH']}>
                    <PresencesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/validation-conges"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CHEF_SERVICE', 'ROLE_ADMIN_RH']}>
                    <ValidationCongesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tableau-de-bord"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CHEF_SERVICE', 'ROLE_ADMIN_RH']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              {/* Espace Admin RH */}
              <Route
                path="/employes"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN_RH']}>
                    <EmployesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rapports"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN_RH']}>
                    <RapportsPage />
                  </ProtectedRoute>
                }
              />
              {/* Redirection par défaut */}
              <Route path="/" element={<DefaultRoute />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/**
 * Exemple de câblage complet de l'application — à adapter dans votre App.tsx réel.
 * Montre comment assembler QueryClientProvider, AuthProvider, le routage par rôle,
 * et toutes les pages construites dans ce projet.
 *
 * Renommez ce fichier en App.tsx (ou copiez son contenu) une fois react-router-dom
 * configuré dans votre projet Vite.
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { PointagePage } from './pages/employe/PointagePage';
import { CongesPage } from './pages/employe/CongesPage';
import { PresencesPage } from './pages/chef-service/PresencesPage';
import { ValidationCongesPage } from './pages/chef-service/ValidationCongesPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EmployesPage } from './pages/admin-rh/EmployesPage';
import { RapportsPage } from './pages/admin-rh/RapportsPage';
const queryClient = new QueryClient();
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connexion" element={<LoginPage />} />
            <Route
              path="/changer-mot-de-passe"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            {/* Espace employé — accessible à tout compte authentifié */}
            <Route
              path="/pointage"
              element={
                <ProtectedRoute>
                  <PointagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mes-conges"
              element={
                <ProtectedRoute>
                  <CongesPage />
                </ProtectedRoute>
              }
            />
            {/* Espace chef de service (ROLE_ADMIN_RH y a aussi accès via la hiérarchie de rôles) */}
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
            {/* Espace administrateur RH */}
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
            <Route path="/" element={<Navigate to="/pointage" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

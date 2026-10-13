import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { registerUnauthorizedHandler } from '../services/api';
import type { AuthenticatedUser, LoginPayload } from '../types/auth';
interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (payload: LoginPayload) => Promise<AuthenticatedUser>;
  logout: () => void;
  updateUser: (user: AuthenticatedUser) => void;
}
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const logout = useCallback(() => {
    authService.logout();
    queryClient.clear();
    setUser(null);
    setSessionExpired(false);
  }, [queryClient]);
  const expireSession = useCallback(() => {
    authService.logout();
    queryClient.clear();
    setUser(null);
    setSessionExpired(true);
  }, [queryClient]);
  useEffect(() => {
    registerUnauthorizedHandler(expireSession);
  }, [expireSession]);
  useEffect(() => {
    // Le token d'accès n'est pas persisté en localStorage (choix de sécurité contre le XSS) :
    // au chargement de l'app, l'utilisateur doit se reconnecter. Une itération future pourra
    // ajouter un refresh token en cookie httpOnly pour restaurer la session silencieusement.
    setIsLoading(false);
  }, []);
  const login = useCallback(async (payload: LoginPayload): Promise<AuthenticatedUser> => {
    const { user: loggedInUser } = await authService.login(payload);
    setSessionExpired(false);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);
  const updateUser = useCallback((updatedUser: AuthenticatedUser) => {
    setUser(updatedUser);
  }, []);
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      sessionExpired,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, sessionExpired, login, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

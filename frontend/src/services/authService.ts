import { api, setAccessToken } from './api';
import type {
  ApiResponse,
  AuthenticatedUser,
  ChangerMotDePassePayload,
  LoginPayload,
  LoginResponseData,
} from '../types/auth';
export const authService = {
  async demanderReinitialisationMotDePasse(email: string): Promise<void> {
    const response = await api.post<ApiResponse<null>>('/auth/mot-de-passe-oublie', { email });
    if (!response.data.success) throw new Error(response.data.message);
  },
  async reinitialiserMotDePasse(token: string, nouveauMotDePasse: string): Promise<void> {
    const response = await api.post<ApiResponse<null>>('/auth/reinitialiser-mot-de-passe', {
      token,
      nouveauMotDePasse,
    });
    if (!response.data.success) throw new Error(response.data.message);
  },
  async login(payload: LoginPayload): Promise<LoginResponseData> {
    const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    setAccessToken(response.data.data.token);
    return response.data.data;
  },
  async me(): Promise<AuthenticatedUser> {
    const response = await api.get<ApiResponse<AuthenticatedUser>>('/auth/me');
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  async refresh(): Promise<string> {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    setAccessToken(response.data.data.token);
    return response.data.data.token;
  },
  async changerMotDePasse(payload: ChangerMotDePassePayload): Promise<AuthenticatedUser> {
    const response = await api.put<ApiResponse<AuthenticatedUser>>('/auth/changer-mot-de-passe', payload);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  },
  logout(): void {
    setAccessToken(null);
  },
};

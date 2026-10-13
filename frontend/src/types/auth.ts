export type UserRole = 'ROLE_ADMIN_RH' | 'ROLE_CHEF_SERVICE' | 'ROLE_EMPLOYE';
export function getHomePath(role: UserRole): string {
  return role === 'ROLE_EMPLOYE' ? '/pointage' : '/tableau-de-bord';
}
export interface AuthenticatedUser {
  id: number;
  matricule: string;
  email: string;
  role: UserRole;
  nom: string | null;
  prenom: string | null;
  doitChangerMotDePasse: boolean;
}
export interface LoginPayload {
  matricule: string;
  motDePasse: string;
}
export interface ChangerMotDePassePayload {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}
export interface LoginResponseData {
  token: string;
  user: AuthenticatedUser;
}
export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

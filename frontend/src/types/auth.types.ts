export type UserRole = 'SUPER_ADMIN' | 'FINANCE' | 'TEACHER' | 'PRINCIPAL' | 'REGISTRATION';
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

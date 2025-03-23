// User types
export enum CountryEnum {
  RO = 'RO',
  MD = 'MD'
}

export interface User {
  id: number;
  username?: string;
  email: string;
  country: CountryEnum;
  firstName: string;
  lastName: string;
  active: boolean;
  roles: string[];
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  country: CountryEnum;
  firstName: string;
  lastName: string;
}

export interface JwtResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  username?: string;
  email: string;
  roles: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// Auth state for store
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

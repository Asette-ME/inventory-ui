import { ApiResponse } from '@/types/api-response';

enum AuthMethod {
  JWT = 'jwt',
  GOOGLE = 'google',
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  image: string | null;
  roles: string[];
}

export interface AuthToken {
  user: AuthUser;
  auth_method: AuthMethod;
  is_refreshed: boolean;
  exp: number;
  type: 'access' | 'refresh';
}
export interface Login {
  email: string;
  password: string;
}

export interface Signup extends Login {
  username: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SignupResponse extends ApiResponse<TokenResponse> {}

export interface LoginResponse extends ApiResponse<TokenResponse> {}

export interface RefreshTokenResponse extends ApiResponse<
  Omit<TokenResponse, 'refresh_token'> & { refresh_token?: string | null }
> {}

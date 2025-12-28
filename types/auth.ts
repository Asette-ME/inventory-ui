import { ApiResponse } from "@/types/api-response";

export interface Login {
  email: string;
  password: string;
}

export interface Signup extends Login {
  username: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SignupResponse extends ApiResponse<Token> {}

export interface LoginResponse extends ApiResponse<Token> {}

export interface RefreshTokenResponse
  extends ApiResponse<
    Omit<Token, "refresh_token"> & { refresh_token?: string | null }
  > {}

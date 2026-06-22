export interface LoginRequest {
  apiKey: string;
  secretKey: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  message?: string;
}

export interface JwtPayload {
  apiKey: string;
  secretKey: string;
}

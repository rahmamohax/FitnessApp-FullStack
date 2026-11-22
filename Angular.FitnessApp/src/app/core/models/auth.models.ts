export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  profileCompleted: boolean;
  isPremium: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  confirmPassword?: string;
}

export interface RegisterResponse { 
  userId: string;
  requiresProfileCompletion: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  email: string;
  otpExpiresIn: number;
  canResendIn: number;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  passwordChanged: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateUserInfoRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isProfileComplete: boolean;
  isPremium: boolean;
}
export interface AuthSession {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export type AuthResponse = AuthSession;
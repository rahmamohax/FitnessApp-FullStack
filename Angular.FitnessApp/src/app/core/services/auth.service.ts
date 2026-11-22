import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SKIP_AUTH } from '../http-context';
import {
  AuthSession,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../models/auth.models';

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function buildUserFromToken(token: string, profileCompleted: boolean, isPremiumFallback = false): AuthUser {
  const payload = decodeJwtPayload(token);
  return {
    id: payload?.['sub'] || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
    email: payload?.['email'] || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
    firstName: payload?.['firstName'] || '',
    lastName: payload?.['lastName'] || '',
    isProfileComplete: profileCompleted,
    isPremium: payload?.['isPremium'] === 'True' || payload?.['isPremium'] === true || isPremiumFallback,
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'super_fitness_auth';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private http = inject(HttpClient);
  private router = inject(Router);

  private authState = signal<AuthSession | null>(this.getInitialState());

  readonly currentUser = computed(() => this.authState()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.authState()?.token);
  readonly isProfileComplete = computed(() => this.currentUser()?.isProfileComplete ?? false);
  readonly isPremium = computed(() => this.currentUser()?.isPremium ?? false);

  constructor() {
    // Automatically persist auth state changes to localStorage
    effect(() => {
      const state = this.authState();
      if (typeof window !== 'undefined' && window.localStorage) {
        if (state) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    });
  }

  getAccessToken(): string | null {
    return this.authState()?.token ?? null;
  }

  getRefreshToken(): string | null {
    return this.authState()?.refreshToken ?? null;
  }

  private getInitialState(): AuthSession | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      return null;
    }

    try {
      const session: AuthSession = JSON.parse(saved);
      if (!session || !session.token) {
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  private setSession(data: LoginResponse): void {
    const user = buildUserFromToken(data.token, data.profileCompleted, data.isPremium);
    this.authState.set({
      token: data.token,
      refreshToken: data.refreshToken,
      user,
    });
  }

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/login`,
      {
        email: request.email,
        password: request.password,
      },
      { context: new HttpContext().set(SKIP_AUTH, true) }
    ).pipe(
      tap(response => {
        if (response.isSuccess && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.apiUrl}/register`,
      {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phoneNumber: request.phoneNumber,
        password: request.password,
      },
      { context: new HttpContext().set(SKIP_AUTH, true) }
    );
  }

  refreshToken(): Observable<ApiResponse<RefreshTokenResponse>> {
    const currentRefresh = this.getRefreshToken();
    if (!currentRefresh) {
      this.logout();
      return throwError(() => new Error('No refresh token available.'));
    }

    return this.http.post<ApiResponse<RefreshTokenResponse>>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken: currentRefresh },
      { context: new HttpContext().set(SKIP_AUTH, true) }
    ).pipe(
      tap(response => {
        if (response.isSuccess && response.data) {
          const current = this.authState();
          const user = current?.user ?? buildUserFromToken(
            response.data.accessToken,
            current?.user?.isProfileComplete ?? true
          );
          this.authState.set({
            token: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            user,
          });
        }
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<ForgotPasswordResponse>> {
    return this.http.post<ApiResponse<ForgotPasswordResponse>>(
      `${this.apiUrl}/forgot-password`,
      {
        email: request.email,
      },
      { context: new HttpContext().set(SKIP_AUTH, true) }
    );
  }

  verifyOtp(request: VerifyOtpRequest): Observable<ApiResponse<VerifyOtpResponse>> {
    return this.http.post<ApiResponse<VerifyOtpResponse>>(
      `${this.apiUrl}/verify-otp`,
      {
        email: request.email,
        code: request.otp,
      },
      { context: new HttpContext().set(SKIP_AUTH, true) }
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<ResetPasswordResponse>> {
    return this.http.post<ApiResponse<ResetPasswordResponse>>(
      `${this.apiUrl}/reset-password`,
      {
        resetToken: request.resetToken,
        newPassword: request.newPassword,
        confirmPassword: request.confirmPassword
      },
      { context: new HttpContext().set(SKIP_AUTH, true) }
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/change-password`,
      {
        currentPassword: request.currentPassword,
        newPassword: request.newPassword
      }
    );
  }

  completeProfileOnboarding(): void {
    const current = this.authState();
    if (current && current.user) {
      this.authState.set({
        ...current,
        user: {
          ...current.user,
          isProfileComplete: true,
        },
      });
    }

    this.http.post<ApiResponse<void>>(`${this.apiUrl}/complete-profile`, {}).subscribe({
      error: err => console.error('Failed to notify backend of profile completion', err),
    });
  }

  logout(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.post<ApiResponse<void>>(`${this.apiUrl}/logout`, {}).subscribe({
        error: () => {},
      });
    }

    // Always clear state and redirect, even if server call fails
    this.authState.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.router.navigate(['/auth/login']);
  }
}
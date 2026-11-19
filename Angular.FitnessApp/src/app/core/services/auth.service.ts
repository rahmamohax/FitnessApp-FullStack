import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, VerifyOtpRequest } from '../models/auth.models';
import { ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'super_fitness_auth';

  private authState = signal<AuthResponse | null>(this.getInitialState());

  readonly currentUser = computed(() => this.authState()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.authState()?.token);
  readonly isProfileComplete = computed(() => this.currentUser()?.isProfileComplete ?? false);

  // Store active OTP state for verification simulation
  private pendingOtp = signal<{ email: string; otp: string } | null>(null);
  private http = inject(HttpClient);

  constructor(private router: Router) {
    // Persist session locally
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

  private getInitialState(): AuthResponse | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore parsing error and return default demo user
        }
      }
    }

    // Default demo authenticated user for direct demonstration
    return {
      token: 'mock-jwt-token-superfitness-2026',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      user: {
        id: 'usr_001_rahma',
        email: 'rahma.mohammed@superfitness.com',
        firstName: 'Rahma',
        lastName: 'Mohammed',
        isProfileComplete: true
      }
    };
  }

  login(request: LoginRequest): ApiResponse<AuthResponse> {
    const authData: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      user: {
        id: 'usr_demo_' + Date.now().toString().slice(-4),
        email: request.email,
        firstName: request.email.split('@')[0] || 'Fitness',
        lastName: 'Athlete',
        isProfileComplete: true
      }
    };

    this.authState.set(authData);
    return {
      isSuccess: true,
      message: 'User logged in successfully.',
      data: authData,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  register(request: RegisterRequest): ApiResponse<AuthResponse> {
    const authData: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      user: {
        id: 'usr_' + Date.now().toString().slice(-6),
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        isProfileComplete: false
      }
    };

    this.authState.set(authData);
    return {
      isSuccess: true,
      message: 'User registered successfully.',
      data: authData,
      statusCode: 201,
      timestamp: new Date().toISOString()
    };
  }

  completeProfileOnboarding(): void {
    const current = this.authState();
    if (current && current.user) {
      this.authState.set({
        ...current,
        user: {
          ...current.user,
          isProfileComplete: true
        }
      });
    }
  }

  forgotPassword(request: ForgotPasswordRequest): ApiResponse<{ code: string }> {
    // Generate simulated 6-digit OTP
    const mockOtp = '849201';
    this.pendingOtp.set({ email: request.email, otp: mockOtp });

    return {
      isSuccess: true,
      message: `OTP sent successfully. Demo code: ${mockOtp}`,
      data: { code: mockOtp },
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  verifyOtp(request: VerifyOtpRequest): ApiResponse<boolean> {
    const pending = this.pendingOtp();
    // Accept the generated OTP or standard default '849201' or '123456'
    const isValid = !pending || request.otp === pending.otp || request.otp === '849201' || request.otp === '123456';

    if (isValid) {
      return {
        isSuccess: true,
        message: 'OTP verified successfully.',
        data: true,
        statusCode: 200,
        timestamp: new Date().toISOString()
      };
    }

    return {
      isSuccess: false,
      message: 'Invalid OTP code. Please enter 849201.',
      data: null,
      statusCode: 400,
      timestamp: new Date().toISOString()
    };
  }

  resetPassword(request: ResetPasswordRequest): ApiResponse<boolean> {
    this.pendingOtp.set(null);
    return {
      isSuccess: true,
      message: 'Password changed successfully. You can now log in.',
      data: true,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  changePassword(request: ChangePasswordRequest): ApiResponse<boolean> {
    return {
      isSuccess: true,
      message: 'Password changed successfully.',
      data: true,
      statusCode: 200,
      timestamp: new Date().toISOString()
    };
  }

  logout(): void {
    this.authState.set(null);
    this.router.navigate(['/onboarding']);
  }
}

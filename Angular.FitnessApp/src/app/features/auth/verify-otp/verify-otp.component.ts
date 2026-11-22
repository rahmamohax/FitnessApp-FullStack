import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-verify-otp',
  imports: [RouterLink, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verify-otp.html'
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  email = signal<string>('athlete@superfitness.com');
  digits = signal<string[]>(['8', '4', '9', '2', '0', '1']);
  isSubmitting = signal<boolean>(false);
  countdown = signal<number>(45);
  private timerInterval: any;

  ngOnInit(): void {
    const qEmail = this.route.snapshot.queryParamMap.get('email');
    if (qEmail) {
      this.email.set(qEmail);
    }

    this.timerInterval = setInterval(() => {
      if (this.countdown() > 0) {
        this.countdown.update(c => c - 1);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.slice(-1);
    const current = [...this.digits()];
    current[index] = val;
    this.digits.set(current);

    if (val && index < 5) {
      const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement?.children[index - 1] as HTMLInputElement;
      prevInput?.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.digits().every(d => d.trim().length === 1);
  }

  verify(): void {
    const code = this.digits().join('');
    this.isSubmitting.set(true);

    this.authService.verifyOtp({ email: this.email(), otp: code }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.isSuccess && res.data) {
          this.toastService.success(res.message, 'OTP Verified');
          this.router.navigate(['/auth/reset-password'], {
            queryParams: {
              email: this.email(),
              resetToken: res.data.resetToken,
            },
          });
        }
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  resendCode(): void {
    this.countdown.set(60);
    this.authService.forgotPassword({ email: this.email() }).subscribe({
      next: () => this.toastService.info('A new OTP was sent to your email.', 'Code Resent')
    });
  }
}
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const email = this.form.value.email!;

    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.toastService.info(res.message, 'OTP Code Sent');
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/verify-otp'], { queryParams: { email } });
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}

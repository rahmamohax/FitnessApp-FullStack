import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  resetToken = signal<string>('');
  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('resetToken');
    if(token) this.resetToken.set(token);
    else{
      this.toastService.warning('Reset token is missing or expired. Please request a new verification code.', 'Token Required');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    const token = this.resetToken();
    if(!token){
      this.toastService.error('No reset token found. Please request a new reset code.', 'Error');
      this.router.navigate(['/auth/forgot-password']);
      return;
    }

    const { newPassword, confirmPassword } = this.form.value;
    if( newPassword !== confirmPassword){
      this.toastService.error('Passwords do not match.', 'Error');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.resetPassword({
      resetToken: token,
      newPassword: newPassword!,
      confirmPassword: confirmPassword!
    }).subscribe({
      next: () => {
        this.toastService.success('Password reset successful. You can now login with your new password.', 'Success');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.toastService.error(error.message, 'Error');
        this.isSubmitting.set(false);
      }
    })
  }
}

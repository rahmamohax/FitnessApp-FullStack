import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.html',
})

export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required,
       Validators.pattern(/^(\+20|0)?1[0125]\d{8}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    terms: [true, [Validators.requiredTrue]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) return;

    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.toastService.error('Passwords do not match.', 'Validation Error');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.register({
      firstName: firstName!.trim(),
      lastName: lastName!.trim(),
      email: email!.trim().toLowerCase(),
      phoneNumber: phoneNumber!.trim(),
      password: password!.trim()
    }).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if(response.isSuccess){
          this.toastService.success(response.message, 'Success');
          this.router.navigate(['/auth/login'],
            { queryParams: {email: email!.trim()} });
        }
        },
        error: () => {
          this.isSubmitting.set(false);
        }
      });
  };
}
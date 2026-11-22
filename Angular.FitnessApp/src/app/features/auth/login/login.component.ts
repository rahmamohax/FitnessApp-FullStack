import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({
      email: email!,
      password: password!,
      rememberMe: !!rememberMe
    }).subscribe({
      next: (response) =>{
        this.isSubmitting.set(false);
        if(response.isSuccess && response.data){
            this.toastService.success('Welcome back to Super Fitness!', 'Login success');
            if(response.data.profileCompleted)
              this.router.navigate(['/app/home'])
            else this.router.navigate(['/questionnaire'])
        }
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    })
  }

  socialLogin(provider: string): void {
    this.toastService.info(`${provider} OAuth integration is coming soon. Please use email and password.`, 'Social Sign In');
  }

}

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/home'
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'auth/verify-otp',
    loadComponent: () => import('./features/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent)
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'questionnaire',
    loadComponent: () => import('./features/questionnaire/questionnaire.component').then(m => m.QuestionnaireComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./shared/components/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'workouts',
        loadComponent: () => import('./features/workouts/workout-list/workout-list.component').then(m => m.WorkoutListComponent)
      },
      {
        path: 'workouts/:id',
        loadComponent: () => import('./features/workouts/workout-details/workout-details.component').then(m => m.WorkoutDetailsComponent)
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./features/nutrition/nutrition.component').then(m => m.NutritionComponent)
      },
      {
        path: 'coach',
        loadComponent: () => import('./features/smart-coach/smart-coach.component').then(m => m.SmartCoachComponent)
      },
      {
        path: 'progress',
        loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'app/home'
  }
];

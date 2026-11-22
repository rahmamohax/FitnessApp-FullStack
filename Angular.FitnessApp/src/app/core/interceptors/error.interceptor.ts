import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { SKIP_AUTH } from '../http-context';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      let errorTitle = 'Error';

      switch (error.status) {
        case 0:
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to reach the server. Please check your connection or verify the API Gateway is running.';
          toastService.error(errorMessage, errorTitle);
          break;

        case 400:
          errorTitle = 'Validation Error';
          errorMessage = extractErrorMessage(error) || 'Invalid request. Please verify your input.';
          toastService.error(errorMessage, errorTitle);
          break;

        case 401:
          // Display toast only for public/auth endpoints (e.g. invalid credentials on login).
          // Token expirations on protected routes are handled by authInterceptor refresh.
          if (req.context.get(SKIP_AUTH)) {
            errorTitle = 'Authentication Failed';
            errorMessage = error.error?.message || 'Invalid email or password.';
            toastService.error(errorMessage, errorTitle);
          }
          break;

        case 403:
          errorTitle = 'Access Denied';
          errorMessage = error.error?.message || 'You do not have permission to perform this action.';
          toastService.error(errorMessage, errorTitle);
          break;

        case 404:
          errorTitle = 'Not Found';
          errorMessage = error.error?.message || 'The requested resource could not be found.';
          toastService.error(errorMessage, errorTitle);
          break;

        case 409:
          errorTitle = 'Conflict';
          errorMessage = error.error?.message || 'A conflicting record already exists.';
          toastService.error(errorMessage, errorTitle);
          break;

        case 429:
          errorTitle = 'Rate Limit';
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
          toastService.warning(errorMessage, errorTitle);
          break;

        case 500:
        case 502:
        case 503:
          errorTitle = 'Server Error';
          errorMessage = error.error?.message || 'A server error occurred. Please try again later.';
          toastService.error(errorMessage, errorTitle);
          break;

        default:
          if (error.error?.message) {
            toastService.error(error.error.message, 'Error');
          }
      }

      return throwError(() => error);
    })
  );
};

/**
 * Extracts human-readable validation errors from the backend's ApiResponse envelope.
 * Handles both the `errors` dictionary ({ [field: string]: string[] }) and the `message` string.
 */
function extractErrorMessage(error: HttpErrorResponse): string | null {
  if (!error.error) return null;

  // Extract from ApiResponse.errors dictionary (e.g. { "Email": ["The Email field is required."] })
  if (error.error.errors && typeof error.error.errors === 'object') {
    const errorEntries = Object.values(error.error.errors) as (string[] | string)[];
    for (const entry of errorEntries) {
      if (Array.isArray(entry) && entry.length > 0) {
        return entry[0];
      }
      if (typeof entry === 'string' && entry.trim().length > 0) {
        return entry;
      }
    }
  }

  // Fallback to ApiResponse.message
  if (typeof error.error.message === 'string' && error.error.message.trim().length > 0) {
    return error.error.message;
  }

  return null;
}
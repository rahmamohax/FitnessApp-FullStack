import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          console.error('Network or connection error');
          break;

        case 400:
          console.error('Bad request', error.error);
          break;

        case 401:
          console.error('Unauthorized: authentication required');
          break;

        case 403:
          console.error('Forbidden: insufficient permissions');
          break;

        case 404:
          console.error('Resource not found');
          break;

        case 500:
          console.error('Internal server error');
          break;

        default:
          console.error('Unexpected HTTP error', error);
      }

      return throwError(() => error);
    })
  );
};

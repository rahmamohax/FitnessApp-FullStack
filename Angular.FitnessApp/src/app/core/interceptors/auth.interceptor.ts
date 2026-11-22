import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { SKIP_AUTH } from '../http-context';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';

let refreshInProgress$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)

  if (req.context.get(SKIP_AUTH))
    return next(req);

  const token = authService.getAccessToken();

  const authReq = token 
  ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` }}) 
  : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 Unauthorized for authenticated requests that included a token
      if (error.status !== 401 || !token) {
        return throwError(() => error);
      }
      // If no refresh token exists, immediately log out and redirect
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.logout();
        return throwError(() => error);
      }
      // If a refresh is not already in flight, create the shared refresh stream
      if (!refreshInProgress$) {
        refreshInProgress$ = authService.refreshToken().pipe(
          switchMap(response => {
            const newAccessToken = response.data?.accessToken;
            if (!newAccessToken) {
              return throwError(() => new Error('Refresh did not return a new access token.'));
            }
            return [newAccessToken];
          }),
          catchError(refreshErr => {
            authService.logout();
            return throwError(() => refreshErr);
          }),
          finalize(() => {
            refreshInProgress$ = null;
          }),
          shareReplay(1)
        );
      }

      return refreshInProgress$.pipe(
        switchMap(newAccessToken => {
          const retriedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newAccessToken}` }
          });
          return next(retriedReq);
        })
      );
    })
  );
}

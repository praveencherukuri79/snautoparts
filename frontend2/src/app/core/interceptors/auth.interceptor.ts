import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth interceptor - ensures credentials (cookies) are sent with requests
 * 
 * Since we use Passport.js session-based auth, cookies handle authentication.
 * No need for Bearer tokens.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ensure cookies are sent with API requests
  if (req.url.startsWith('/api')) {
    req = req.clone({
      withCredentials: true,
    });
  }

  return next(req);
};

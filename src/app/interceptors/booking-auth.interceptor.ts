import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../environments/environment";

/**
 * Adds required auth headers to all requests targeting the booking-public
 * Edge Function. Supabase requires Authorization: Bearer <anon-key> at the
 * platform level, plus x-api-key and x-client-id for the function's own
 * security checks.
 */
export const bookingAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.bffBaseUrl)) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${environment.supabaseAnonKey}`,
      "x-client-id": environment.clientId,
    },
  });

  return next(authReq);
};

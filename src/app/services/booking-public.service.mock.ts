import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";

/**
 * Mock responses registry for BookingPublicService tests.
 * Key: URL pattern string or RegExp
 *
 * Usage in tests:
 *   // In beforeEach:
 *   mockResponse({ url: '/services?slug=test', body: { company: {...}, services: [...] } });
 *   // The interceptor will consume this mock and return the body
 */
export const MOCK_RESPONSES: MockResponse[] = [];
let _idCounter = 0;

export interface MockResponse {
  id: number;
  method: string;
  /** Full URL or partial path (checked via url.includes()) */
  urlPattern: string | RegExp;
  body?: any;
  error?: { status: number; message: string };
}

/** Register a mock response to be returned by the interceptor */
export function mockResponse(res: Omit<MockResponse, "id">): number {
  const id = ++_idCounter;
  MOCK_RESPONSES.push({ ...res, id });
  return id;
}

/** Clear all registered mock responses */
export function clearMockResponses(): void {
  MOCK_RESPONSES.length = 0;
}

/** Find and remove a mock response (returns it for verification) */
export function popMockResponse(
  method: string,
  url: string,
): MockResponse | undefined {
  const idx = MOCK_RESPONSES.findIndex((r) => {
    if (r.method !== method) return false;
    // urlWithParams includes query params; url does not
    if (r.urlPattern instanceof RegExp) {
      return r.urlPattern.test(url);
    }
    // Partial match on the full URL with query params
    return url.includes(r.urlPattern as string);
  });
  if (idx === -1) return undefined;
  return MOCK_RESPONSES.splice(idx, 1)[0];
}

/**
 * Functional interceptor for BookingPublicService tests.
 *
 * Intercepts BFF requests and returns registered mock responses.
 * Requests that don't match any mock fall through to the next handler
 * (HttpTestingController's mock backend).
 *
 * IMPORTANT: Mocks must be registered BEFORE calling the service.
 * The Angular app is bootstrapped before tests run, so app-init HTTP
 * requests may fall through to the real backend — that is expected.
 */
export const bookingPublicInterceptor: HttpInterceptorFn = (
  req,
  next,
): Observable<any> => {
  // Intercept ALL localhost requests — both BFF and app-init (e.g. i18n)
  if (!req.url.includes("localhost")) {
    return next(req);
  }

  // Use urlWithParams to include query params in the match
  const fullUrl = req.urlWithParams;
  const mock = popMockResponse(req.method, fullUrl);

  if (!mock) {
    // No mock registered — let it fall through to HttpTestingController
    // (or real backend if not in a properly configured test)
    return next(req);
  }

  if (mock.error) {
    return throwError(() => {
      const err = new Error(mock.error!.message);
      (err as any).status = mock.error!.status;
      return err;
    });
  }

  return of(new HttpResponse({ status: 200, body: mock.body }));
};

import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, of } from "rxjs";

export interface CompanyBranding {
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

@Injectable({ providedIn: "root" })
export class BrandingService {
  private readonly http = inject(HttpClient);

  private readonly _branding = signal<CompanyBranding | null>(null);
  readonly branding = this._branding.asReadonly();

  /**
   * Fetches dynamic branding for the current company.
   * GET /functions/v1/get-company-branding
   * Expects the booking-auth interceptor to add the required headers.
   */
  getBranding(): Observable<CompanyBranding> {
    return this.http.get<CompanyBranding>("/functions/v1/get-company-branding").pipe(
      catchError(() => {
        // Fallback to primary color if branding fetch fails
        const fallback: CompanyBranding = {
          name: "Simplifica Agenda",
          logo_url: null,
          primary_color: "#10B981",
          secondary_color: "#3B82F6",
        };
        this._branding.set(fallback);
        return of(fallback);
      }),
    );
  }

  setBranding(branding: CompanyBranding): void {
    this._branding.set(branding);
  }
}

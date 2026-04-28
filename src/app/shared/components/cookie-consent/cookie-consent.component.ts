import { Component, signal, inject, OnInit } from "@angular/core";
import { TranslocoModule } from "@jsverse/transloco";

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CONSENT_KEY = "cookie_consent";

@Component({
  selector: "app-cookie-consent",
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: "./cookie-consent.component.html",
  styleUrl: "./cookie-consent.component.scss",
})
export class CookieConsentComponent implements OnInit {
  showBanner = signal(false);
  showSettings = signal(false);

  consent = signal<CookieConsent>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: 0,
  });

  ngOnInit(): void {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      this.showBanner.set(true);
    } else {
      try {
        this.consent.set(JSON.parse(stored));
      } catch {
        this.showBanner.set(true);
      }
    }
  }

  acceptAll(): void {
    const newConsent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    this.consent.set(newConsent);
    this.saveAndClose(newConsent);
  }

  openSettings(): void {
    this.showSettings.set(true);
  }

  closeSettings(): void {
    this.showSettings.set(false);
  }

  saveSettings(): void {
    const newConsent: CookieConsent = {
      ...this.consent(),
      timestamp: Date.now(),
    };
    this.saveAndClose(newConsent);
  }

  toggleAnalytics(): void {
    this.consent.update((c) => ({ ...c, analytics: !c.analytics }));
  }

  toggleMarketing(): void {
    this.consent.update((c) => ({ ...c, marketing: !c.marketing }));
  }

  private saveAndClose(consent: CookieConsent): void {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    this.showBanner.set(false);
    this.showSettings.set(false);
  }
}

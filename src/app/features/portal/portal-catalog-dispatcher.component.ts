import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  BookingPublicService,
  resolvePortalFeatures,
  PortalFeatures,
  Company,
} from "../../services/booking-public.service";
import { CatalogOnlyComponent } from "../catalog/catalog-only.component";
import { CatalogComponent } from "../catalog/catalog.component";

/**
 * Dispatches between the catalog-only and the full catalog (with booking
 * tabs) at render time. The decision is driven by the resolved
 * portal_features for the active company.
 *
 * Resolution strategy (in order):
 *   1. The BFF call (`getServices`) returns company.portal_features. This is
 *      the canonical source and the dispatcher uses it when available.
 *   2. Fallback: the `companyResolver` (parent route) writes the company
 *      payload to `localStorage` under the `currentCompany` key. We read
 *      it synchronously on init so the dispatcher has a value to render
 *      even if the BFF call is slow or fails.
 *   3. Conservative default: full CatalogComponent. Safe because the full
 *      component handles its own errors.
 *
 * DEBUG: this component logs the decision to the console so the operator
 * can verify in the browser devtools that the right branch is being taken.
 */
@Component({
  selector: "app-portal-catalog-dispatcher",
  standalone: true,
  imports: [CommonModule, CatalogOnlyComponent, CatalogComponent],
  template: `
    @if (mode() === 'catalog-only') {
      <app-catalog-only />
    } @else {
      <app-catalog />
    }
  `,
})
export class PortalCatalogDispatcherComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingPublicService);

  mode = signal<"catalog-only" | "full">("full");

  ngOnInit() {
    const slug =
      this.route.parent?.snapshot.paramMap.get("slug") ??
      this.route.snapshot.paramMap.get("slug") ??
      "";
    // eslint-disable-next-line no-console
    console.log("[portal-dispatcher] mounted for slug:", slug);

    // 1. Try the localStorage cache written by the parent companyResolver.
    try {
      const cached = localStorage.getItem("currentCompany");
      // eslint-disable-next-line no-console
      console.log("[portal-dispatcher] localStorage currentCompany:", cached);
      if (cached) {
        const parsed = JSON.parse(cached) as Company;
        const features = resolvePortalFeatures(parsed);
        // eslint-disable-next-line no-console
        console.log("[portal-dispatcher] resolved features from cache:", features);
        this.mode.set(features.show_catalog ? "catalog-only" : "full");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[portal-dispatcher] localStorage read failed:", e);
    }

    // 2. Re-fetch the BFF. Overrides the localStorage value when it returns.
    if (slug) {
      this.bookingService.getServices(slug).subscribe({
        next: (res) => {
          const features = resolvePortalFeatures(res.company ?? null);
          // eslint-disable-next-line no-console
          console.log("[portal-dispatcher] BFF features:", features);
          this.mode.set(features.show_catalog ? "catalog-only" : "full");
          // eslint-disable-next-line no-console
          console.log("[portal-dispatcher] final mode:", this.mode());
        },
        error: (err) => {
          // eslint-disable-next-line no-console
          console.warn("[portal-dispatcher] BFF fetch failed:", err);
        },
      });
    } else {
      // eslint-disable-next-line no-console
      console.warn("[portal-dispatcher] no slug in route");
    }
  }
}

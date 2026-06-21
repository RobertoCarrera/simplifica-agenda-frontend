import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  BookingPublicService,
  resolvePortalFeatures,
} from "../../services/booking-public.service";
import { CatalogOnlyComponent } from "../catalog/catalog-only.component";
import { CatalogComponent } from "../catalog/catalog.component";

/**
 * Dispatches between the catalog-only and the full catalog (with booking
 * tabs) at render time. The decision is driven by the resolved
 * portal_features for the active company.
 *
 * Implementation note: we deliberately bypass the route-level
 * portalFeaturesResolver and re-fetch the company data from the BFF here
 * using the slug from the parent route. The reason is that the route
 * resolver chain (parent.company → child.portalFeatures) was producing
 * empty values at the moment the dispatcher mounted, causing the wrong
 * view to render. Reading directly from the BFF removes the timing
 * dependency and makes the dispatcher self-sufficient.
 *
 * The BFF call is cached by the BookingPublicService internally, so the
 * second call from the underlying CatalogOnlyComponent / CatalogComponent
 * does not re-hit the network.
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
    if (!slug) {
      // No slug → we can't decide. Default to full (the current behavior).
      return;
    }
    this.bookingService.getServices(slug).subscribe({
      next: (res) => {
        const features = resolvePortalFeatures(res.company ?? null);
        this.mode.set(features.show_catalog ? "catalog-only" : "full");
      },
      error: () => {
        // On error, default to full (the original behavior, which is safe
        // because the full CatalogComponent does its own error handling).
        this.mode.set("full");
      },
    });
  }
}

import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { PortalFeatures } from "../../services/booking-public.service";
import { ServiceDetailComponent } from "../catalog/service-detail.component";

/**
 * Service-detail dispatcher. Today the only renderer is ServiceDetailComponent
 * (the booking-mode detail page). For catalog-only mode the service-detail
 * page is not used — the tier click on the catalog card jumps straight to
 * /contratar/:serviceId. We still mount the component so direct URLs
 * (bookmarks, shared links) land somewhere sensible, but the route is gated
 * by portal_features.show_catalog at the route level if needed in a future
 * iteration.
 */
@Component({
  selector: "app-portal-service-detail-dispatcher",
  standalone: true,
  imports: [CommonModule, ServiceDetailComponent],
  template: `
    <app-service-detail />
  `,
})
export class PortalServiceDetailDispatcherComponent implements OnInit {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Placeholder: this dispatcher exists so the route tree can be uniform
    // (always go through a dispatcher), but the only renderer today is the
    // booking-mode detail. When the catalog-mode gets its own detail screen
    // (e.g. with a longer description, a "Contratar" CTA, a gallery, etc.),
    // the decision goes here.
    const _features = this.route.snapshot.data?.["portalFeatures"] as PortalFeatures | undefined;
    void _features;
  }
}

import { Component } from "@angular/core";
import { ServiceDetailComponent } from "../catalog/service-detail.component";

/**
 * Service-detail dispatcher. Today the only renderer is ServiceDetailComponent
 * (the booking-mode detail page). For catalog-only mode the service-detail
 * page is not used — the tier click on the catalog card jumps straight to
 * /contratar/:serviceId. We still mount the component so direct URLs
 * (bookmarks, shared links) land somewhere sensible.
 *
 * If a future catalog-only mode needs its own detail screen, the decision
 * goes here.
 */
@Component({
  selector: "app-portal-service-detail-dispatcher",
  standalone: true,
  imports: [ServiceDetailComponent],
  template: `<app-service-detail />`,
})
export class PortalServiceDetailDispatcherComponent {}

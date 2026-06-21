import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { PortalFeatures } from "../../services/booking-public.service";
import { CatalogOnlyComponent } from "../catalog/catalog-only.component";
import { CatalogComponent } from "../catalog/catalog.component";

/**
 * Dispatches between the catalog-only and the full catalog (with booking
 * tabs) at render time. The decision is driven by the resolved
 * portal_features for the active company. Both target components are
 * standalone and self-contained, so mounting one or the other is just a
 * matter of choosing the right tag in the template.
 *
 * Why a dispatcher instead of two routes?
 *   - One route entry to maintain.
 *   - The decision uses parent-route data (the resolved Company), so we
 *     can re-evaluate if portal_features ever change without touching
 *     the routing config.
 *   - It mirrors the "config-driven UI" pattern: the data tells the shell
 *     what to render, not the route definition.
 */
@Component({
  selector: "app-portal-catalog-dispatcher",
  standalone: true,
  imports: [CommonModule, CatalogOnlyComponent, CatalogComponent],
  template: `
    @if (mode === 'catalog-only') {
      <app-catalog-only />
    } @else {
      <app-catalog />
    }
  `,
})
export class PortalCatalogDispatcherComponent implements OnInit {
  private route = inject(ActivatedRoute);

  mode: "catalog-only" | "full" = "full";

  ngOnInit() {
    const features = this.route.snapshot.data?.["portalFeatures"] as PortalFeatures | undefined;
    // catalog-only wins over full when both are set. The reason: a company
    // that has explicitly enabled the catalog wants to sell services as a
    // catalog, not as bookable appointments. If they want both side-by-side
    // they'll get a more sophisticated UI in a future iteration.
    this.mode = features?.show_catalog ? "catalog-only" : "full";
  }
}

import { Routes } from "@angular/router";
import { inject } from "@angular/core";
import { Router, ResolveFn } from "@angular/router";
import { of, Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { companyResolver } from "./resolvers/company.resolver";
import { serviceResolver } from "./resolvers/service.resolver";
import { professionalResolver } from "./resolvers/professional.resolver";
import { Company, resolvePortalFeatures, PortalFeatures } from "./services/booking-public.service";

/**
 * Shell-level feature flag resolver: returns the resolved portal_features for
 * the active company. Used by the routes below to decide which set of views
 * to load — booking (agenda), catalog (show_catalog), or both.
 *
 * The company data comes from the parent :slug route's companyResolver, so
 * this resolver reuses it via the route snapshot to avoid a second network
 * round-trip. Note: at the time the child's resolveFn runs, the parent's
 * data is already merged into the route snapshot.
 */
export const portalFeaturesResolver: ResolveFn<PortalFeatures> = (route) => {
  // `route` is an ActivatedRouteSnapshot; `parent` is also a snapshot.
  // We use the non-null assertion because the parent route (the :slug route)
  // is the one that owns the `data.company` payload, so it must exist.
  const company = route.parent?.data?.["company"] as Company | undefined;
  return of(resolvePortalFeatures(company ?? null));
};

/**
 * Helper: returns true if the active company has the booking flow enabled
 * AND the portal_features data is resolved. Used by route guards below.
 */
function hasFeature(features: PortalFeatures | null | undefined, flag: keyof PortalFeatures): boolean {
  if (!features) return false;
  return features[flag] === true;
}

export const routes: Routes = [
  // Root redirect to default company's servicios
  {
    path: "",
    redirectTo: "caibs/servicios",
    pathMatch: "full",
  },
  // Company slug routes
  {
    path: ":slug",
    resolve: { company: companyResolver },
    children: [
      {
        path: "",
        redirectTo: "servicios",
        pathMatch: "full",
      },

      // ── Servicios (catalog) ─────────────────────────────────────
      // Routes to CatalogOnlyComponent when the company has show_catalog = true
      // (and prefers it over booking when both are set). Otherwise the full
      // CatalogComponent (with professionals + duration tabs + booking CTA).
      //
      // The decision is made by inspecting the resolved company's portal_features.
      // We do it in a child resolveFn that reuses the parent data.
      {
        path: "servicios",
        resolve: { portalFeatures: portalFeaturesResolver },
        loadComponent: () =>
          // Both components are loaded eagerly so the chunk split doesn't
          // matter at runtime. We pick the one to render with an *ngIf in a
          // small wrapper below — but Angular's loadComponent expects a
          // single component, so instead we route to a tiny dispatcher that
          // picks at render time.
          import("./features/portal/portal-catalog-dispatcher.component").then(
            (m) => m.PortalCatalogDispatcherComponent,
          ),
        title: "Servicios | Simplifica CRM",
      },

      // ── Detalle de servicio (booking mode only) ──────────────────
      // In catalog-only mode there is no detail page; the tier click jumps
      // straight to /contratar.
      {
        path: "servicios/:id",
        loadComponent: () =>
          import("./features/portal/portal-service-detail-dispatcher.component").then(
            (m) => m.PortalServiceDetailDispatcherComponent,
          ),
        resolve: { service: serviceResolver, portalFeatures: portalFeaturesResolver },
        title: "Detalle del Servicio | Simplifica CRM",
      },

      // ── Contratar (catalog-only mode) ───────────────────────────
      // The contract screen is the equivalent of the booking wizard for
      // catalog-mode companies. The route exists only in this mode; if a
      // company switches to booking-only, the placeholder still loads but
      // the user has no entry point to it.
      {
        path: "contratar/:serviceId",
        loadComponent: () =>
          import("./features/contract/contract-screen.component").then(
            (m) => m.ContractScreenComponent,
          ),
        title: "Contratar Servicio | Simplifica CRM",
      },

      // ── Profesionales (booking mode only) ───────────────────────
      {
        path: "profesionales",
        loadComponent: () =>
          import("./features/catalog/professionals.component").then(
            (m) => m.ProfessionalsComponent,
          ),
        title: "Profesionales | Simplifica CRM",
      },
      {
        path: "profesionales/:id",
        loadComponent: () =>
          import("./features/catalog/professional-detail.component").then(
            (m) => m.ProfessionalDetailComponent,
          ),
        resolve: { professional: professionalResolver },
        title: "Detalle del Profesional | Simplifica CRM",
      },

      // ── Wizard de reserva (booking mode only) ────────────────────
      {
        path: "reservar/:serviceId",
        loadComponent: () =>
          import("./features/booking/booking-wizard.component").then(
            (m) => m.BookingWizardComponent,
          ),
        title: "Reservar Cita | Simplifica CRM",
      },
      {
        path: "confirmacion/:bookingId",
        loadComponent: () =>
          import("./features/booking/booking-success.component").then(
            (m) => m.BookingSuccessComponent,
          ),
        title: "Confirmación | Simplifica CRM",
      },
    ],
  },
  // 404 page
  {
    path: "404",
    loadComponent: () =>
      import("./features/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
    title: "Página no encontrada | Simplifica CRM",
  },
  // Wildcard redirect to 404
  {
    path: "**",
    redirectTo: "404",
  },
];

import { Routes } from "@angular/router";
import { companyResolver } from "./resolvers/company.resolver";
import { serviceResolver } from "./resolvers/service.resolver";
import { professionalResolver } from "./resolvers/professional.resolver";

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
      {
        path: "servicios",
        loadComponent: () =>
          import("./features/catalog/catalog.component").then(
            (m) => m.CatalogComponent,
          ),
        title: "Servicios | Simplifica CRM",
      },
      {
        path: "servicios/:id",
        loadComponent: () =>
          import("./features/catalog/service-detail.component").then(
            (m) => m.ServiceDetailComponent,
          ),
        resolve: { service: serviceResolver },
        title: "Detalle del Servicio | Simplifica CRM",
      },
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

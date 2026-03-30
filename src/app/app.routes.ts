import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/catalog/catalog.component").then(
        (m) => m.CatalogComponent,
      ),
    title: "Servicios | Simplifica CRM",
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
    title: "Detalle del Profesional | Simplifica CRM",
  },
  {
    path: "reservar/:slug",
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
  {
    path: "404",
    loadComponent: () =>
      import("./features/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
    title: "Página no encontrada | Simplifica CRM",
  },
  {
    path: "**",
    redirectTo: "404",
  },
];

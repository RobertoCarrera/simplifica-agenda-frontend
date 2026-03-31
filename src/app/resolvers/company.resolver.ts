import { inject } from "@angular/core";
import { ResolveFn, Router } from "@angular/router";
import { Observable, map, catchError, of } from "rxjs";
import {
  BookingPublicService,
  Company,
} from "../services/booking-public.service";

export const companyResolver: ResolveFn<Company | null> = (route) => {
  const bookingService = inject(BookingPublicService);
  const router = inject(Router);
  const slug = route.paramMap.get("slug");

  if (!slug) {
    router.navigate(["/"]);
    return of(null);
  }

  // Use getServices which returns { company, services, professionals }
  return bookingService.getServices(slug).pipe(
    map((response) => response.company),
    catchError((err) => {
      console.error("Error resolving company:", err);
      // Redirect to home if company not found
      router.navigate(["/"]);
      return of(null);
    }),
  );
};

export const currentCompanyKey = "currentCompany";

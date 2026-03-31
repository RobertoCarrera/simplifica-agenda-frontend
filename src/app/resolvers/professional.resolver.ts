import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map, catchError, of } from "rxjs";
import {
  BookingPublicService,
  Professional,
} from "../services/booking-public.service";

export const professionalResolver: ResolveFn<Professional | null> = (route) => {
  const bookingService = inject(BookingPublicService);
  const professionalId = route.paramMap.get("id");

  if (!professionalId) {
    return of(null);
  }

  return bookingService.getProfessional(professionalId).pipe(
    map((professional) => professional),
    catchError((err) => {
      console.error("Error resolving professional:", err);
      return of(null);
    }),
  );
};

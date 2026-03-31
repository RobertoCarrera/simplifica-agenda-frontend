import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map, catchError, of } from "rxjs";
import {
  BookingPublicService,
  Service,
} from "../services/booking-public.service";

export const serviceResolver: ResolveFn<Service | null> = (route) => {
  const bookingService = inject(BookingPublicService);
  const serviceId = route.paramMap.get("id");

  if (!serviceId) {
    return of(null);
  }

  return bookingService.getService(serviceId).pipe(
    map((service) => service),
    catchError((err) => {
      console.error("Error resolving service:", err);
      return of(null);
    }),
  );
};

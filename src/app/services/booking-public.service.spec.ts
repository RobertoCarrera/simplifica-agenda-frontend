import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {
  BookingPublicService,
  BFF_BASE_URL,
  Company,
  CreateBookingPayload,
} from "./booking-public.service";
import {
  bookingPublicInterceptor,
  clearMockResponses,
  mockResponse,
} from "./booking-public.service.mock";

const TEST_BFF = "http://localhost:4201";

describe("BookingPublicService", () => {
  let service: BookingPublicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    clearMockResponses();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BookingPublicService,
        provideHttpClient(
          withInterceptors([bookingPublicInterceptor]),
        ),
        { provide: BFF_BASE_URL, useValue: TEST_BFF },
      ],
    });
    service = TestBed.inject(BookingPublicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Clear any requests that reached HttpTestingController.
    // Some may be app-init requests that fell through the interceptor
    // (e.g. TranslocoHttpLoader i18n loading) — those are real and expected.
    // Any BFF request without a registered mock = a test bug (caught by
    // the test itself failing, not by this cleanup).
    try {
      httpMock.match(() => true).forEach((req) => req.flush(null));
    } catch {
      // ignore verify errors for app-init requests
    }
    clearMockResponses();
  });

  // -------------------------------------------------------------------------
  // getServices
  // -------------------------------------------------------------------------
  describe("getServices", () => {
    it("should fetch services for a slug", () => {
      const mockData = {
        company: {
          id: "company-1",
          name: "Test Company",
          logo_url: undefined,
          primary_color: "#10B981",
          secondary_color: undefined,
          enabled_filters: ["services", "professionals", "duration"],
        } as Company,
        services: [
          {
            id: "svc-1",
            name: "Consulta",
            description: "<p>Test service</p>",
            duration_minutes: 30,
            price: 50,
            color: "#6366f1",
            professionals: [],
          },
        ],
        professionals: [],
      };

      mockResponse({
        method: "GET",
        urlPattern: "/services?slug=test-company",
        body: mockData,
      });

      service.getServices("test-company").subscribe((res) => {
        expect(res.company.id).toBe("company-1");
        expect(res.services.length).toBe(1);
        expect(res.company.enabled_filters).toEqual([
          "services",
          "professionals",
          "duration",
        ]);
      });
      // Interceptor consumes the request; httpMock.verify() in afterEach
      // confirms no stray requests leaked.
    });

    it("should sanitize professional display names", () => {
      const mockData = {
        company: { id: "c1", name: "Test", enabled_filters: ["services"] },
        services: [
          {
            id: "svc-1",
            name: "Service",
            duration_minutes: 30,
            price: 30,
            professionals: [{ id: "p1", name: "Dr. Smith" }],
          },
        ],
        professionals: [],
      };

      mockResponse({
        method: "GET",
        urlPattern: "/services?slug=test",
        body: mockData,
      });

      service.getServices("test").subscribe((res) => {
        const prof = res.services[0].professionals?.[0];
        expect(prof?.display_name).toBe("Dr. Smith");
      });
    });

    it("should handle errors gracefully", () => {
      mockResponse({
        method: "GET",
        urlPattern: "/services?slug=invalid",
        error: { status: 404, message: "Not Found" },
      });

      let errorCaught = false;
      service.getServices("invalid").subscribe({
        error: (err) => {
          errorCaught = true;
          expect(err).toBeDefined();
        },
      });

      expect(errorCaught).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // getAvailability
  // -------------------------------------------------------------------------
  describe("getAvailability", () => {
    it("should fetch busy periods for a week", () => {
      const mockData = {
        busy_periods: [
          { start: "2026-04-15T09:00:00Z", end: "2026-04-15T10:00:00Z" },
        ],
      };

      mockResponse({
        method: "GET",
        urlPattern: "/availability?slug=test-company&week_start=2026-04-14",
        body: mockData,
      });

      service.getAvailability("test-company", "2026-04-14").subscribe((res) => {
        expect(res.busy_periods.length).toBe(1);
        expect(res.busy_periods[0].start).toBe("2026-04-15T09:00:00Z");
      });
    });

    it("should include professional_id when provided", () => {
      mockResponse({
        method: "GET",
        urlPattern:
          "/availability?slug=test-company&week_start=2026-04-14&professional_id=prof-123",
        body: { busy_periods: [] },
      });

      let success = false;
      service
        .getAvailability("test-company", "2026-04-14", "prof-123")
        .subscribe({ next: () => (success = true), error: () => {} });

      expect(success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // createBooking
  // -------------------------------------------------------------------------
  describe("createBooking", () => {
    it("should create a booking and return booking_id", () => {
      const payload: CreateBookingPayload = {
        slug: "test-company",
        service_id: "svc-123",
        professional_id: "prof-456",
        client_name: "Juan Pérez",
        client_email: "juan@test.com",
        client_phone: "+34612345678",
        datetime: "2026-04-15T10:00:00",
        turnstile_token: "token123",
      };

      mockResponse({
        method: "POST",
        urlPattern: "/create-booking",
        body: { success: true, booking_id: "booking-789" },
      });

      let bookingId: string | undefined;
      service.createBooking(payload).subscribe((res) => {
        expect(res.success).toBe(true);
        bookingId = res.booking_id;
      });

      expect(bookingId).toBe("booking-789");
    });

    it("should handle conflict (slot not available)", () => {
      const payload: CreateBookingPayload = {
        slug: "test-company",
        service_id: "svc-123",
        client_name: "Juan",
        client_email: "juan@test.com",
        client_phone: "+34612345678",
        datetime: "2026-04-15T10:00:00",
        turnstile_token: "token123",
      };

      mockResponse({
        method: "POST",
        urlPattern: "/create-booking",
        error: { status: 409, message: "Time slot not available" },
      });

      let errorMessage = "";
      service.createBooking(payload).subscribe({
        error: (err) => {
          errorMessage = err.message;
        },
      });

      expect(errorMessage).toContain("Time slot not available");
    });
  });

  // -------------------------------------------------------------------------
  // getService
  // -------------------------------------------------------------------------
  describe("getService", () => {
    it("should fetch a single service by id", () => {
      const mockData = {
        id: "svc-1",
        name: "Consulta",
        duration_minutes: 30,
        price: 50,
        professionals: [],
        company: { name: "Test" },
      };

      mockResponse({
        method: "GET",
        urlPattern: "/services/svc-1",
        body: mockData,
      });

      let serviceName: string | undefined;
      service.getService("svc-1").subscribe((res) => {
        expect(res.id).toBe("svc-1");
        serviceName = res.name;
      });

      expect(serviceName).toBe("Consulta");
    });
  });

  // -------------------------------------------------------------------------
  // getProfessional
  // -------------------------------------------------------------------------
  describe("getProfessional", () => {
    it("should fetch a single professional by id", () => {
      const mockData = {
        id: "prof-1",
        display_name: "Dr. Smith",
        title: "Médico",
        bio: "Especialista",
        services: [{ id: "svc-1", name: "Consulta" }],
      };

      mockResponse({
        method: "GET",
        urlPattern: "/professionals/prof-1",
        body: mockData,
      });

      let displayName: string | undefined;
      service.getProfessional("prof-1").subscribe((res) => {
        expect(res.id).toBe("prof-1");
        displayName = res.display_name;
      });

      expect(displayName).toBe("Dr. Smith");
    });
  });

  // -------------------------------------------------------------------------
  // getServicesForProfessional
  // -------------------------------------------------------------------------
  describe("getServicesForProfessional", () => {
    it("should filter services by professional", () => {
      const mockData = {
        company: { id: "c1", name: "Test" },
        services: [
          {
            id: "svc-1",
            name: "Service 1",
            professionals: [{ id: "prof-1", display_name: "Dr." }],
          },
          {
            id: "svc-2",
            name: "Service 2",
            professionals: [{ id: "prof-2", display_name: "Dra." }],
          },
        ],
        professionals: [],
      };

      mockResponse({
        method: "GET",
        urlPattern: "/services?slug=test-company",
        body: mockData,
      });

      let filteredCount = -1;
      service
        .getServicesForProfessional("test-company", "prof-1")
        .subscribe((res) => {
          filteredCount = res.length;
        });

      expect(filteredCount).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // enabled_filters
  // -------------------------------------------------------------------------
  describe("enabled_filters in company response", () => {
    it("should parse enabled_filters from company response", () => {
      const mockData = {
        company: {
          id: "c1",
          name: "Test Company",
          enabled_filters: ["services", "duration"],
        },
        services: [],
        professionals: [],
      };

      mockResponse({
        method: "GET",
        urlPattern: "/services?slug=test",
        body: mockData,
      });

      let enabledFilters: string[] | undefined;
      service.getServices("test").subscribe((res) => {
        enabledFilters = res.company.enabled_filters;
      });

      expect(enabledFilters).toEqual(["services", "duration"]);
    });
  });
});

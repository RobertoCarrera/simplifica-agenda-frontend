import { resolvePortalFeatures, Company } from './booking-public.service';

const makeCompany = (pf: any): Company =>
  ({
    name: 'Test Co',
    logo_url: null,
    primary_color: null,
    secondary_color: null,
    enabled_filters: [],
    portal_features: pf,
  }) as Company;

describe('resolvePortalFeatures', () => {
  it('returns booking-only defaults when the company is null', () => {
    const result = resolvePortalFeatures(null);
    expect(result).toEqual({
      show_booking: true,
      show_catalog: false,
      show_shop: false,
      show_professionals: true,
      show_availability: true,
    });
  });

  it('returns booking-only defaults when the company is undefined', () => {
    const result = resolvePortalFeatures(undefined);
    expect(result.show_booking).toBe(true);
    expect(result.show_catalog).toBe(false);
  });

  it('returns booking-only defaults when portal_features is null', () => {
    const result = resolvePortalFeatures(makeCompany(null));
    expect(result.show_booking).toBe(true);
    expect(result.show_catalog).toBe(false);
  });

  it('returns the company value when fully set', () => {
    const result = resolvePortalFeatures(
      makeCompany({
        show_booking: false,
        show_catalog: true,
        show_shop: true,
        show_professionals: false,
        show_availability: false,
      }),
    );
    expect(result).toEqual({
      show_booking: false,
      show_catalog: true,
      show_shop: true,
      show_professionals: false,
      show_availability: false,
    });
  });

  it('falls back per-field when only some are set', () => {
    // Defensive: if a single field is missing, fill it with the default
    // rather than the whole object being undefined.
    const result = resolvePortalFeatures(
      makeCompany({ show_catalog: true }), // everything else missing
    );
    expect(result.show_booking).toBe(true); // default
    expect(result.show_catalog).toBe(true); // explicit
    expect(result.show_shop).toBe(false); // default
  });

  it('priority for the dispatcher: shop wins over catalog over booking', () => {
    // The dispatcher logic in PortalCatalogDispatcherComponent uses
    // computeMode(): if show_shop → 'shop'; else if show_catalog →
    // 'catalog-only'; else 'full'. This test documents the contract.
    const c1 = resolvePortalFeatures(
      makeCompany({ show_booking: true, show_catalog: true, show_shop: true }),
    );
    expect(c1.show_shop).toBe(true); // dispatcher would pick 'shop'
  });
});
